#!/bin/bash
# Launch index.html for mobile testing with a local web server
# This script starts a local server and opens the page in your default browser
# Use browser DevTools to test mobile responsiveness

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PORT=8000
URL="http://localhost:$PORT"

echo "========================================="
echo "Tepper & Bennett - Mobile Testing Server"
echo "========================================="
echo ""

# Check if port is already in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port $PORT is already in use."
    echo ""
    echo "Options:"
    echo "1. Open http://localhost:$PORT in your browser to test"
    echo "2. Kill the existing server and run this script again"
    echo "3. Change the PORT variable in this script"
    echo ""
    read -p "Open browser anyway? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open "$URL"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open "$URL"
        else
            echo "Please open $URL in your browser manually."
        fi
    fi
    exit 0
fi

# Start the server in the background
echo "Starting local web server on port $PORT..."
cd "$SCRIPT_DIR"

# Try Python 3 first, then Python 2, then npx http-server
if command -v python3 &> /dev/null; then
    echo "Using Python 3 http.server"
    python3 -m http.server $PORT > /dev/null 2>&1 &
    SERVER_PID=$!
elif command -v python &> /dev/null; then
    echo "Using Python 2 SimpleHTTPServer"
    python -m SimpleHTTPServer $PORT > /dev/null 2>&1 &
    SERVER_PID=$!
elif command -v npx &> /dev/null; then
    echo "Using npx http-server"
    npx http-server -p $PORT -s > /dev/null 2>&1 &
    SERVER_PID=$!
else
    echo "❌ Error: No suitable HTTP server found."
    echo "Please install Python or Node.js to run a local server."
    exit 1
fi

# Give the server a moment to start
sleep 1

# Check if server started successfully
if ! ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "❌ Error: Failed to start server"
    exit 1
fi

echo "✅ Server started successfully (PID: $SERVER_PID)"
echo ""
echo "📱 Testing URL: $URL"
echo ""
echo "Next steps:"
echo "1. Browser will open automatically"
echo "2. Press Cmd+Option+I (Mac) or Ctrl+Shift+I (Windows/Linux) to open DevTools"
echo "3. Press Cmd+Shift+M (Mac) or Ctrl+Shift+M (Windows/Linux) for device emulation"
echo "4. Select a mobile device (e.g., iPhone 12 Pro) or set width to 375px"
echo "5. Navigate to the Song List section to test the table layout"
echo ""
echo "🛑 To stop the server: Press Ctrl+C or run: kill $SERVER_PID"
echo ""

# Wait a bit more to ensure server is fully ready
sleep 1

# Open in default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "$URL"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    start "$URL"
else
    echo "⚠️  Could not auto-open browser. Please open $URL manually."
fi

echo "Browser opened. Server is running..."
echo ""
echo "Press Ctrl+C to stop the server when done."

# Keep the script running and handle Ctrl+C gracefully
trap "echo ''; echo 'Stopping server...'; kill $SERVER_PID 2>/dev/null; echo 'Server stopped.'; exit 0" INT TERM

# Wait for the server process
wait $SERVER_PID
