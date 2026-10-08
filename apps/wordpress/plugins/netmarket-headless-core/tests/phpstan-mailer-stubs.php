<?php

namespace PHPMailer\PHPMailer;

class Exception extends \Exception
{
}

class PHPMailer
{
    public function addAttachment(string $path, string $name = '', string $encoding = 'base64', string $type = ''): bool
    {
        return true;
    }
}
