#!/usr/bin/env python3

"""
File Watch Flash - Screen Flash Notification Script

This script monitors a specific file for changes and flashes the screen when events occur.
It's designed to provide visual feedback when certain file operations happen, particularly
useful for automated workflows or development environments.

WHAT IT DOES:
- Watches for changes to `.cursor_response_complete` file in the current directory
- Flashes the screen with a fullscreen image or white color when the file is created
- Optionally flashes on file deletion or modification (currently commented out)
- Uses Swift code to create a temporary fullscreen window for the flash effect

DEPENDENCIES:
- Python 3.6+
- watchdog library: Install with `pip install watchdog`
- macOS with Swift compiler (for the screen flash functionality)
- Optional: Image file at ~/alfred-e-neuman.jpeg for custom flash image

USAGE:
1. Make sure you have the watchdog library installed:
   pip install watchdog

2. Run the script:
   ./scripts/file-watch-flash.py
   or
   python3 scripts/file-watch-flash.py

3. The script will start monitoring and print status messages
4. Press Ctrl+C to stop the monitoring

CONFIGURATION:
- FILE_TO_WATCH: The file to monitor (default: ".cursor_response_complete")
- FLASH_IMAGE: Path to custom flash image (default: "~/alfred-e-neuman.jpeg")

EVENTS:
- FILE CREATED: Triggers screen flash (active)
- FILE DELETED: Prints message only (flash commented out)
- FILE MODIFIED: Prints message only (flash commented out)

This is a Python translation of the original bash script 'file-watch-flash' that used
fswatch for file monitoring. The Python version uses the cross-platform watchdog library
for better portability while maintaining the same core functionality.
"""

import os
import sys
import time
import tempfile
import subprocess
import threading
from pathlib import Path
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

FILE_TO_WATCH = ".cursor_response_complete"
FLASH_IMAGE = os.path.expanduser("~/system-flash-image.jpg")

# Swift code for flashing screen (parameterized for image or white)
SWIFT_FLASH_CODE = '''
import Cocoa

let app = NSApplication.shared
let window = NSWindow(
    contentRect: NSScreen.main!.frame,
    styleMask: [.borderless],
    backing: .buffered,
    defer: false
)

window.backgroundColor = NSColor.white
window.level = NSWindow.Level(rawValue: Int(CGWindowLevelForKey(.maximumWindow)))
window.isOpaque = true
window.ignoresMouseEvents = true

// Check if we have an image path argument
if let imagePath = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : nil,
   let image = NSImage(contentsOfFile: imagePath) {
    let imageView = NSImageView(frame: window.contentView!.bounds)
    imageView.image = image
    imageView.imageScaling = .scaleProportionallyUpOrDown
    window.contentView?.addSubview(imageView)
    
    // Show image for longer duration
    window.makeKeyAndOrderFront(nil)
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
        window.close()
        app.terminate(nil)
    }
} else {
    // Show white flash for shorter duration
    window.makeKeyAndOrderFront(nil)
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
        window.close()
        app.terminate(nil)
    }
}

app.run()
'''

class FileWatcher(FileSystemEventHandler):
    def __init__(self, file_to_watch):
        super().__init__()
        self.file_to_watch = file_to_watch
        self.filename = os.path.basename(file_to_watch)
    
    def _execute_swift_code(self, swift_code, *args):
        """Execute Swift code with optional arguments"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.swift', delete=False) as temp_script:
            temp_script_path = temp_script.name
            temp_script.write(swift_code)
            temp_script.flush()
            
            # Run swift script with any provided arguments
            cmd = ['swift', temp_script_path] + list(args)
            subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Clean up after a moment
        def cleanup():
            time.sleep(1.5)
            try:
                os.unlink(temp_script_path)
            except OSError:
                pass
        
        cleanup_thread = threading.Thread(target=cleanup, daemon=True)
        cleanup_thread.start()
    
    def flash_screen(self):
        """Flash the screen with image or white color"""
        # Convert image path to absolute path
        abs_flash_image = os.path.abspath(FLASH_IMAGE) if os.path.exists(FLASH_IMAGE) else None
        
        if abs_flash_image and os.path.isfile(abs_flash_image):
            # Flash with image
            self._execute_swift_code(SWIFT_FLASH_CODE, abs_flash_image)
        else:
            # Flash with white color
            self._execute_swift_code(SWIFT_FLASH_CODE)
    
    def _handle_file_event(self, event, event_type, should_flash=False):
        """Handle file events with common logic"""
        if not event.is_directory and event.src_path.endswith(self.filename):
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            print(f"{timestamp} - File {event_type}: {event.src_path}")
            if should_flash:
                self.flash_screen()
    
    def on_created(self, event):
        self._handle_file_event(event, "CREATED", should_flash=True)
    
    def on_deleted(self, event):
        self._handle_file_event(event, "DELETED", should_flash=False)

    def on_modified(self, event):
        self._handle_file_event(event, "MODIFIED", should_flash=False)

def main():
    # Create the directory for the file if it doesn't exist
    file_path = Path(FILE_TO_WATCH)
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Create the file if it doesn't exist (watchdog needs it to exist)
    file_path.touch(exist_ok=True)
    
    print(f"Watching for changes to: {FILE_TO_WATCH}")
    print(f"Flash image: {FLASH_IMAGE}")
    print("Press Ctrl+C to stop...")
    
    # Set up file watcher
    event_handler = FileWatcher(FILE_TO_WATCH)
    observer = Observer()
    
    # Watch the directory containing the file
    watch_dir = str(file_path.parent.absolute())
    observer.schedule(event_handler, watch_dir, recursive=False)
    
    try:
        observer.start()
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping file watcher...")
        observer.stop()
    
    observer.join()

if __name__ == "__main__":
    main() 