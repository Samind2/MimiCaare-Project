package services

import (
	"log"
	"os"

	"github.com/resendlabs/resend-go"
)

func SendEmail(to string, subject string, htmlContent string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	client := resend.NewClient(apiKey)

	params := &resend.SendEmailRequest{
		From:    "Acme <onboarding@resend.dev>", // ต้องเป็น verified sender domain
		To:      []string{to},
		Subject: subject,
		Html:    htmlContent,
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		log.Println("❌ ส่งอีเมลล้มเหลว:", err)
		return err
	}

	log.Println("📧 ส่งอีเมลสำเร็จ:", sent.Id)
	return nil
}
