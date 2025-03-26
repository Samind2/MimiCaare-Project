package cloudinary

import (
	"fmt"
	"log"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
)

type Cloudinary struct {
	Cdnry *cloudinary.Cloudinary
}

func CloudinaryConfig() *Cloudinary {
	cloudName := os.Getenv("CLOUDNAME")
	apiKey := os.Getenv("APIKEY")
	apiSecret := os.Getenv("APISECRET")

	var err error
	cdnry, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		log.Fatal("ไม่สามารถเชื่อมต่อกับ Cloudinary", err)
	} else {
		fmt.Println("เชื่อมต่อกับ Cloudinary สำเร็จ!")
	}
	return &Cloudinary{Cdnry: cdnry}
}
