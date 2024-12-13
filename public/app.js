let objectDetector;  // Declare object detector
let video;  // Declare video element
let detections = [];  // Store detection results
let imageCaptured = false;  // Flag to prevent multiple image captures

// Credit card width to height aspect ratio (standard size: 3.37 x 2.125 inches)
const aspectRatio = 3.37 / 2.125;  // Width / Height

// Set minimum and maximum bounding box size limits (in pixels)
const minSize = 80;  // Minimum size of the bounding box (in pixels)
const maxSize = 200; // Maximum size of the bounding box (in pixels)

// Pixels per inch (PPI) for the video canvas size
const ppiWidth = 3.37 / 640;  // Pixels per inch for width
const ppiHeight = 2.125 / 480; // Pixels per inch for height

let widthDetails = '';  // To store and display width details below the canvas
let heightDetails = '';  // To store and display height details below the canvas
let realWidthDetails = '';  // To store and display real-world width details
let realHeightDetails = '';  // To store and display real-world height details
let confidenceDetails = '';  // To store and display the confidence details

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent('canvas-container'); // Attach canvas to the div
  background(255);

  // Create video capture element
  video = createCapture(VIDEO, videoReady); // Use callback to check when video is ready
  video.size(640, 480);
  video.hide();  // Hide the video element to display only canvas
}

// Callback function when the video is ready
function videoReady() {
  console.log('Video is ready!');
  // Initialize the COCO-SSD object detector
  objectDetector = ml5.objectDetector('cocossd', modelReady);
}

// This function is called when the model is ready
function modelReady() {
  console.log('COCO-SSD model loaded!');
  detectObjects();  // Start detecting objects once the model is ready
}

// Function to continuously detect objects in the video feed
function detectObjects() {
  objectDetector.detect(video, gotResults);  // Detect objects in the current frame
}

// Callback function to handle the results of detection
function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  detections = results;  // Update the detections array with new results
  detectObjects();  // Keep detecting in real-time
}

// Function to display the results on the canvas
function draw() {
  image(video, 0, 0);  // Draw the video feed to the canvas

  // Initialize confidence as a placeholder
  confidenceDetails = "Confidence: 0%";

  // Loop through all the detected objects
  for (let i = 0; i < detections.length; i++) {
    let object = detections[i];

    // Only draw bounding box for objects with confidence above a threshold
    if (object.confidence > 0.5) {
      
      // Calculate aspect ratio of the detected object
      let detectedAspectRatio = object.width / object.height;

      // Check if the detected object is close to the credit card aspect ratio (3.37 / 2.125)
      let isCreditCard = Math.abs(detectedAspectRatio - aspectRatio) < 0.2; // Allow some margin for variation

      // Check the size of the detected object (bounding box width and height)
      let isSizeValid = object.width > minSize && object.width < maxSize && object.height > minSize && object.height < maxSize;

      // Only display the bounding box if the object matches both the aspect ratio and size criteria
      if (isCreditCard && isSizeValid && !imageCaptured) {
        // Draw the bounding box around detected object
        noFill();
        stroke(0, 255, 0);  // Green stroke color
        strokeWeight(4);
        rect(object.x, object.y, object.width, object.height);

        // Update the confidence display for this object
        confidenceDetails = `Confidence: ${(object.confidence * 100).toFixed(2)}%`;

        // Only capture the image if confidence is 90% or higher
        if (object.confidence >= 0.9 && !imageCaptured) {
          // Capture image and display dimensions
          takePicture(object);
        }
      }
    }
  }

  // Display the detected details below the canvas
  displayDetails();
}

// Function to capture a picture and display dimensions
function takePicture(object) {
  let img = get();  // Capture the current canvas as an image
  img.save('credit_card_detected', 'png');  // Save the image

  // Convert the detected object size to real-world dimensions (in inches)
  let realWidthInches = object.width * ppiWidth;
  let realHeightInches = object.height * ppiHeight;

  // Store the details to display below the canvas
  widthDetails = `Width: ${object.width}px`;
  heightDetails = `Height: ${object.height}px`;
  realWidthDetails = `Real Width: ${realWidthInches.toFixed(2)} inches`;
  realHeightDetails = `Real Height: ${realHeightInches.toFixed(2)} inches`;

  // Set imageCaptured flag to prevent multiple captures for the same object
  imageCaptured = true;
  // Reset flag after a short delay (for example, 3 seconds) to allow re-detection
  setTimeout(() => {
    imageCaptured = false;
  }, 3000);
}

// Function to display the detected details below the canvas
function displayDetails() {
  // Display details below the canvas
  fill(255, 0, 0);
  textSize(18);
  textAlign(LEFT);
  text(widthDetails, 10, height + 30);
  text(heightDetails, 10, height + 60);
  text(realWidthDetails, 10, height + 90);
  text(realHeightDetails, 10, height + 120);
  text(confidenceDetails, 10, height + 150);
}
