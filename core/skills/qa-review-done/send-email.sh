#!/bin/bash
# QA Review - Email Sender Script
# Envía email con resumen de QA review

EMAIL_TO="${QA_EMAIL_TO:-{{userEmail}}}"
EMAIL_FROM="${QA_EMAIL_FROM:-qa-bot@gextiona.com}"
SUBJECT="$1"
BODY_FILE="$2"

# Función para enviar email usando diferentes métodos
send_email() {
    local method="$1"

    case "$method" in
        "sendgrid")
            # Usar API de SendGrid si está disponible
            if [ -n "$SENDGRID_API_KEY" ]; then
                echo "📧 Enviando email via SendGrid..."
                curl -X POST https://api.sendgrid.com/v3/mail/send \
                  -H "Authorization: Bearer $SENDGRID_API_KEY" \
                  -H "Content-Type: application/json" \
                  -d "{
                    \"personalizations\": [{\"to\": [{\"email\": \"$EMAIL_TO\"}]}],
                    \"from\": {\"email\": \"$EMAIL_FROM\"},
                    \"subject\": \"$SUBJECT\",
                    \"content\": [{\"type\": \"text/html\", \"value\": $(cat "$BODY_FILE" | jq -Rs .)}]
                  }"
                return $?
            fi
            return 1
            ;;

        "mailgun")
            # Usar API de Mailgun si está disponible
            if [ -n "$MAILGUN_API_KEY" ] && [ -n "$MAILGUN_DOMAIN" ]; then
                echo "📧 Enviando email via Mailgun..."
                curl -s --user "api:$MAILGUN_API_KEY" \
                  https://api.mailgun.net/v3/$MAILGUN_DOMAIN/messages \
                  -F from="$EMAIL_FROM" \
                  -F to="$EMAIL_TO" \
                  -F subject="$SUBJECT" \
                  -F html="<$(cat "$BODY_FILE")"
                return $?
            fi
            return 1
            ;;

        "smtp")
            # Usar SMTP local si está disponible
            if command -v sendmail &> /dev/null; then
                echo "📧 Enviando email via sendmail..."
                (
                    echo "To: $EMAIL_TO"
                    echo "From: $EMAIL_FROM"
                    echo "Subject: $SUBJECT"
                    echo "Content-Type: text/html; charset=UTF-8"
                    echo ""
                    cat "$BODY_FILE"
                ) | sendmail -t
                return $?
            fi
            return 1
            ;;

        "powershell")
            # Usar PowerShell Send-MailMessage en Windows
            if command -v powershell.exe &> /dev/null; then
                echo "📧 Enviando email via PowerShell..."
                local body_content=$(cat "$BODY_FILE" | sed 's/"/\\"/g' | tr -d '\n')
                powershell.exe -Command "
                    \$body = @\"
$(cat "$BODY_FILE")
\"@
                    Send-MailMessage -From '$EMAIL_FROM' -To '$EMAIL_TO' -Subject '$SUBJECT' -Body \$body -BodyAsHtml -SmtpServer 'smtp.gmail.com' -Port 587 -UseSsl -Credential (Get-Credential)
                "
                return $?
            fi
            return 1
            ;;

        "log")
            # Como fallback, guardar en log file
            echo "📝 Guardando email en log (no se pudo enviar)..."
            local log_file=".claude/qa-reports/email-$(date +%Y%m%d_%H%M%S).html"
            mkdir -p .claude/qa-reports
            cat > "$log_file" <<EOF
To: $EMAIL_TO
From: $EMAIL_FROM
Subject: $SUBJECT
Date: $(date)

$(cat "$BODY_FILE")
EOF
            echo "✅ Email guardado en: $log_file"
            echo "⚠️  NOTA: Email NO fue enviado. Configurar servicio de email."
            return 0
            ;;
    esac
}

# Intentar diferentes métodos en orden de preferencia
for method in sendgrid mailgun smtp powershell log; do
    if send_email "$method"; then
        echo "✅ Email enviado correctamente a $EMAIL_TO"
        exit 0
    fi
done

echo "❌ Error: No se pudo enviar email"
exit 1
