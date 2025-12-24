# Error Level Analysis (ELA) - Documentation

## Overview

Error Level Analysis (ELA) is a forensic technique used to detect image modifications by analyzing compression artifacts. It works by recompressing an image at a controlled quality level and comparing the original with the recompressed version.

## How It Works

1. **Recompression**: The original image is recompressed at a controlled quality level (default: 95)
2. **Difference Calculation**: Pixel-level differences between original and recompressed images are computed
3. **Anomaly Detection**: Regions with abnormal error levels are identified, indicating potential modifications

## Detection Capabilities

### COPY Detection
- Identifies duplicated content appearing in multiple locations
- Uses pattern matching to find similar error patterns

### MOVE Detection
- Detects content that has been moved within the document
- Compares error patterns across different regions

### ADD Detection
- Identifies new content added without matching compression artifacts
- Isolated high-error regions indicate additions

### Unknown Anomalies
- Catches suspicious compression patterns that don't fit clear categories

## Integration

ELA is automatically integrated into the document analysis pipeline:

- **Image Files**: JPG, PNG are analyzed directly
- **PDF Files**: Currently not supported (would require PDF-to-image conversion)
- **Scoring**: ELA findings contribute to the overall confidence score (max 15 points penalty)
- **Non-blocking**: If ELA fails, the analysis continues without it

## Output Format

Each ELA anomaly includes:

```javascript
{
  type: "copy" | "move" | "add" | "unknown",
  description: "Human-readable description",
  confidence: 0-100, // Confidence level
  region: {
    x: number,
    y: number,
    width: number,
    height: number
  },
  errorLevel: number // Compression error level
}
```

## Configuration

- **Quality Level**: Default 95 (configurable in ELAService constructor)
- **Threshold**: 2.5x average error (adaptive)
- **Block Size**: Adaptive based on image dimensions

## Dependencies

- **jimp**: Lightweight image processing library (optional, falls back to basic analysis if not available)

## Usage

ELA is automatically executed during document analysis for image files. No manual configuration needed.

## Limitations

- Requires `jimp` package for full functionality
- PDF files need conversion to images first
- Processing time increases with image size
- May produce false positives for heavily compressed images

## Future Enhancements

- PDF page rendering support
- Visualization image generation
- More sophisticated COPY/MOVE detection algorithms
- Adaptive quality level selection




