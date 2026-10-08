<?php

declare(strict_types=1);

namespace Netmarket\HeadlessCore\Mail;

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

final class CareerMailer
{
    /** @param list<string> $headers */
    public function send(string $to, string $subject, string $body, array $headers, string $path, string $filename, string $mimeType): bool
    {
        // PHP upload paths have names such as phpABC123, without the original extension.
        $attach = static function (PHPMailer $mailer) use ($path, $filename, $mimeType): void {
            if (! $mailer->addAttachment($path, $filename, 'base64', $mimeType)) {
                throw new Exception('Unable to attach curriculum.');
            }
        };
        add_action('phpmailer_init', $attach);
        try {
            return wp_mail($to, $subject, $body, $headers);
        } catch (Exception) {
            return false;
        } finally {
            // The upload attachment must never leak into another email in this request.
            remove_action('phpmailer_init', $attach);
        }
    }
}
