#!/bin/bash

clear

PORT="8000"

# Kill any existing server on the specified port
PID=$(lsof -ti :"$PORT")
if [ -n "$PID" ]; then
  echo "Found existing process with PID: $PID on port $PORT. Attempting to kill..."
  kill "$PID"
  if [ $? -eq 0 ]; then
    echo "Successfully killed existing process $PID."
  else
    echo "Failed to kill existing process $PID."
  fi
fi

# Define the Tailwind CSS build command
TAILWIND_COMMAND="npx tailwindcss -i ./src/input.css -o ./home.css --watch" # Added --watch for continuous building

# Define the Python web server command
PYTHON_COMMAND="python3 -m http.server $PORT"

echo "Running Tailwind CSS in watch mode and starting Python web server in the background..."

# Run Tailwind CSS in the background
eval "$TAILWIND_COMMAND &"
TAILWIND_PID=$!
echo "Tailwind CSS (watch mode) started with PID: $TAILWIND_PID"

# Run the Python web server in the background
eval "$PYTHON_COMMAND &"
PYTHON_PID=$!
echo "Python web server started with PID: $PYTHON_PID"

# Wait for a short moment to ensure the server has started
sleep 2

echo "Opening web browser to http://localhost:$PORT..."
open "http://localhost:$PORT/#songs"

echo "Development server started. Tailwind CSS is watching for changes, and the Python web server is serving content."
echo "To stop both, you'll need to kill their PIDs:"
echo "Tailwind CSS PID: $TAILWIND_PID"
echo "Python Server PID: $PYTHON_PID"
