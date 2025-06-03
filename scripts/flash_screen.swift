#!/usr/bin/env swift

import Cocoa

// Help function
func showHelp() {
    print("""
Flash Screen - Screen Flash Utility

USAGE:
    swift flash_screen.swift [IMAGE_PATH]

ARGUMENTS:
    IMAGE_PATH    Optional path to image file to display during flash
                  If not provided, displays a white flash

DESCRIPTION:
    Creates a fullscreen flash effect for visual notifications.
    - With image: Shows the image for 0.5 seconds
    - Without image: Shows white flash for 0.1 seconds
    
    The flash window appears at maximum window level and ignores mouse events.

EXAMPLES:
    swift flash_screen.swift                          # White flash
    swift flash_screen.swift ~/Pictures/flash.jpg     # Image flash

OPTIONS:
    -h, --help    Show this help message and exit
""")
}

// Check for help flags first
let args = CommandLine.arguments
if args.count > 1 && (args[1] == "-h" || args[1] == "--help") {
    showHelp()
    exit(0)
}

let app = NSApplication.shared
app.setActivationPolicy(.regular)

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
if let imagePath = args.count > 1 ? args[1] : nil,
   let image = NSImage(contentsOfFile: imagePath) {
    let imageView = NSImageView(frame: window.contentView!.bounds)
    imageView.image = image
    imageView.imageScaling = .scaleProportionallyUpOrDown
    window.contentView?.addSubview(imageView)
    
    // Show image for longer duration
    window.makeKeyAndOrderFront(nil)
    app.activate(ignoringOtherApps: true)
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
        window.close()
        app.terminate(nil)
    }
} else {
    // Show white flash for shorter duration
    window.makeKeyAndOrderFront(nil)
    app.activate(ignoringOtherApps: true)
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
        window.close()
        app.terminate(nil)
    }
}

app.run() 