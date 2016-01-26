package main

import (
	"fmt"
	"image"
	"image/draw"
	"image/gif"
	"image/png"
	"io"
	"net/http"
	"path/filepath"
	"strings"

	"gopkg.in/mgo.v2/bson"
)

// GET request to '/api/images/<image_id>'.
// Respond with an image from the database.
func getImage(w http.ResponseWriter, r *http.Request) (error, int) {
	// Make sure that this is a GET request.
	if err, status := verifyMethod("GET", w, r); err != nil {
		return err, status
	}

	// Get the image_id from the url ('/api/images/<image_id>').
	baseLocation := "/api/images/"
	imageId := strings.TrimPrefix(r.URL.Path, baseLocation)

	// If no image_id was provided, respond with status 400.
	if imageId == "" {
		return fmt.Errorf("No image specified\n"),
			http.StatusBadRequest
	}

	// Find the image file in the database.
	imageObjectId := bson.ObjectIdHex(imageId)
	imageFile, err := dbFs.OpenId(imageObjectId)
	if err != nil {
		return fmt.Errorf("Failed to open image %v: %v", imageId, err),
			http.StatusInternalServerError
	}
	defer imageFile.Close()

	// Set the response header Content-Type and status code.
	w.Header().Set("Content-Type", "image/png")
	w.WriteHeader(http.StatusOK)

	// Write the image bytes to the response.
	_, err = io.Copy(w, imageFile)
	if err != nil {
		return fmt.Errorf(
				"Failed to write image %v to response: %v", imageId, err,
			),
			http.StatusInternalServerError
	}

	// Return a nil error if none were caught.
	return nil, http.StatusOK
}

// Save a non-animated version of a GIF in the database.
// The stored image will be a PNG.
// Return a url path which can the client can use to request the stored image.
func saveNonAnimatedGif(imageUrl string) (string, error) {
	// Fetch the GIF image.
	res, err := http.Get(imageUrl)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	// Convert the bytes of the GIF into a '*gif.GIF' type.
	gifBytes := res.Body
	gifImage, err := gif.DecodeAll(gifBytes)
	if err != nil {
		return "", err
	}

	// Find the 'x, y' dimensions of the GIF.
	imgWidth, imgHeight := getGifDimensions(gifImage)

	// Create a new image with the same size as the GIF.
	overpaintImage := image.NewRGBA(image.Rect(0, 0, imgWidth, imgHeight))

	// Draw the first frame of the GIF onto the newly created image.
	draw.Draw(
		// Set the destination to the newly created image.
		overpaintImage,
		// Draw over the whole destination image.
		overpaintImage.Bounds(),
		// Use the first frame of the GIF as the source.
		gifImage.Image[0],
		// Set the start point to the zero point: (0, 0).
		image.ZP,
		// Set the alpha channel of the image.
		// Use the Porter-Duff Src compositing operator,
		//   as opposed to the Over operator,
		//   since this will be the first and last layer of the final image.
		draw.Src,
	)

	// Make a filename for the new image.
	// Use the filename of the GIF image, replacing ".gif" with ".png".
	basename := filepath.Base(imageUrl)
	ext := filepath.Ext(basename)
	basenameWithoutExt := strings.TrimSuffix(basename, ext)
	newFilename := concat(basenameWithoutExt, ".png")

	// Create a file for the new image in the database.
	dbFile, err := dbFs.Create(newFilename)
	if err != nil {
		return "", err
	}
	defer dbFile.Close()

	// Write the new image to the database file, using png encoding.
	pngEncoder := png.Encoder{CompressionLevel: png.BestCompression}
	err = pngEncoder.Encode(dbFile, overpaintImage)
	if err != nil {
		return "", err
	}

	// Convert the database file's id to a string.
	dbFileId, ok := dbFile.Id().(bson.ObjectId)
	if !ok {
		return "", fmt.Errorf(
			"What? Mongodb file's object id is not a mongodb object id?\n",
		)
	}
	dbFileIdHex := dbFileId.Hex()

	// Return the url path which the client can use
	//   to request the new PNG image.
	previewUrl := concat("/api/images/", dbFileIdHex)
	fmt.Printf("previewUrl: %v\n", previewUrl)
	return previewUrl, nil
}

// Return the maximum dimensions of a GIF.
func getGifDimensions(gif *gif.GIF) (x, y int) {
	var lowestX int
	var lowestY int
	var highestX int
	var highestY int

	for _, img := range gif.Image {
		if img.Rect.Min.X < lowestX {
			lowestX = img.Rect.Min.X
		}
		if img.Rect.Min.Y < lowestY {
			lowestY = img.Rect.Min.Y
		}
		if img.Rect.Max.X > highestX {
			highestX = img.Rect.Max.X
		}
		if img.Rect.Max.Y > highestY {
			highestY = img.Rect.Max.Y
		}
	}

	return highestX - lowestX, highestY - lowestY
}

// Save a non-animated version of a GIF in the database.
// The stored image will be a PNG.
// Return a url path which can the client can use to request the stored image.
func deleteNonAnimatedGif(imageUrl string) (error, int) {
	// Get the imageId from the endpoint of the imageUrl.
	imageId := filepath.Base(imageUrl)

	// Convert the imageId to an Mongo ObjectId.
	imageObjectId := bson.ObjectIdHex(imageId)

	// Remove the image file with this id from the database.
	err := dbFs.RemoveId(imageObjectId)
	if err != nil {
		return fmt.Errorf(
				"Failed to remove image %v in the database: %v",
				imageId, err,
			),
			http.StatusInternalServerError
	}

	return nil, http.StatusOK
}
