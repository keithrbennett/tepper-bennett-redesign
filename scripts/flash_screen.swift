import Cocoa

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
if let imagePath = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : nil,
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