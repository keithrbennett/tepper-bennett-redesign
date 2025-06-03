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
- Optional: Image file for custom flash image

USAGE:
1. Make sure you have the watchdog library installed:
   pip install watchdog

2. Run the script:
   ./scripts/file-watch-flash.py [--file FILE] [--image IMAGE] [--verbose]
   
   Options:
   --file FILE    File to watch (default: .cursor_response_complete)
   --image IMAGE  Flash image path (default: ~/system-flash-image.jpg)
   --verbose      Enable verbose logging

3. The script will start monitoring and print status messages
4. Press Ctrl+C to stop the monitoring

CONFIGURATION:
- FILE_TO_WATCH: The file to monitor (configurable via --file)
- FLASH_IMAGE: Path to custom flash image (configurable via --image)
- Flash durations: 0.5s for image, 0.1s for white flash

EVENTS:
- FILE CREATED: Triggers screen flash (active)
- FILE DELETED: Prints message only (flash commented out)
- FILE MODIFIED: Prints message only (flash commented out)

This is a Python translation of the original bash script 'file-watch-flash' that used
fswatch for file monitoring. The Python version uses the cross-platform watchdog library
for better portability while maintaining the same core functionality.
"""

import os
import time
import subprocess
import argparse
import logging
from pathlib import Path
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Default configuration
DEFAULT_FILE_TO_WATCH = ".cursor_response_complete"
DEFAULT_FLASH_IMAGE = "~/system-flash-image.jpg"

# Get the directory where this script is located
SCRIPT_DIR = Path(__file__).parent
SWIFT_SCRIPT_PATH = SCRIPT_DIR / "flash_screen.swift"

class FileWatcher(FileSystemEventHandler):
    def __init__(self, file_to_watch, flash_image):
        super().__init__()
        self.file_to_watch = file_to_watch
        self.filename = os.path.basename(file_to_watch)
        self.flash_image = os.path.expanduser(flash_image)
        logging.info(f"Watching file: {self.file_to_watch}")
        logging.info(f"Flash image: {self.flash_image}")
        logging.info(f"Swift script: {SWIFT_SCRIPT_PATH}")
    
    def _execute_swift_code(self, *args):
        """Execute Swift code with optional arguments"""
        try:
            # First check if swift is available
            swift_check = subprocess.run(['which', 'swift'], capture_output=True, text=True)
            if swift_check.returncode != 0:
                logging.error("Swift compiler not found. Please install Xcode command line tools.")
                return
            
            # Check if our Swift script exists
            if not SWIFT_SCRIPT_PATH.exists():
                logging.error(f"Swift script not found: {SWIFT_SCRIPT_PATH}")
                return
            
            cmd = ['swift', str(SWIFT_SCRIPT_PATH)] + list(args)
            logging.debug(f"Executing Swift command: {' '.join(cmd)}")
            # Use Popen to avoid blocking, but capture stderr temporarily to check for immediate errors
            proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
            # Give it a moment to start and check for immediate errors
            try:
                stdout, stderr = proc.communicate(timeout=0.1)
                if stderr:
                    logging.error(f"Swift execution error: {stderr}")
            except subprocess.TimeoutExpired:
                # This is expected - the Swift app is running
                logging.debug("Swift app started successfully")
        except Exception as e:
            logging.error(f"Error executing Swift code: {e}")
    
    def flash_screen(self):
        """Flash the screen with image or white color"""
        if os.path.isfile(self.flash_image):
            logging.debug(f"Flashing with image: {self.flash_image}")
            self._execute_swift_code(os.path.abspath(self.flash_image))
        else:
            logging.debug("Flashing with white color")
            self._execute_swift_code()
    
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

def setup_logging(verbose=False):
    """Configure logging based on verbosity level"""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description="Monitor file changes and flash screen notifications",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                                    # Use defaults
  %(prog)s --file myfile.txt                  # Watch different file
  %(prog)s --image ~/my-flash.png --verbose   # Custom image with verbose output
        """
    )
    
    parser.add_argument(
        '--file', '-f',
        default=DEFAULT_FILE_TO_WATCH,
        help=f'File to watch for changes (default: {DEFAULT_FILE_TO_WATCH})'
    )
    
    parser.add_argument(
        '--image', '-i',
        default=DEFAULT_FLASH_IMAGE,
        help=f'Flash image path (default: {DEFAULT_FLASH_IMAGE})'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose logging'
    )
    
    return parser.parse_args()

def main():
    """Main function"""
    args = parse_arguments()
    setup_logging(args.verbose)
    
    # Create the directory for the file if it doesn't exist
    file_path = Path(args.file)
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Delete the file if it exists to ensure only freshly CREATED events are handled
    file_path.unlink(missing_ok=True)
    
    print(f"Watching for changes to: {args.file}")
    print(f"Flash image: {args.image}")
    print("Press Ctrl+C to stop...")
    
    # Set up file watcher
    event_handler = FileWatcher(args.file, args.image)
    observer = Observer()
    
    # Watch the directory containing the file
    watch_dir = str(file_path.parent.absolute())
    observer.schedule(event_handler, watch_dir, recursive=False)
    
    try:
        observer.start()
        logging.info("File watcher started")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping file watcher...")
        logging.info("File watcher stopped by user")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
    finally:
        observer.stop()
        observer.join()

if __name__ == "__main__":
    main() 