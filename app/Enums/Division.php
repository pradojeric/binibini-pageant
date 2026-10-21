<?php

namespace App\Enums;

enum Division: string
{
    // Case order is the canonical order used when joining divisions into a pageant type.
    case Mr = 'mr';
    case Ms = 'ms';
    case Hiyas = 'hiyas';

    public function label(): string
    {
        return match ($this) {
            self::Mr    => 'Mr.',
            self::Ms    => 'Ms.',
            self::Hiyas => 'Hiyas',
        };
    }

    /**
     * Parse a stored pageant type ("mr", "mr&ms", "ms&hiyas", ...) into its divisions.
     *
     * @return list<self>
     */
    public static function fromType(?string $type): array
    {
        $keys = array_filter(explode('&', (string) $type));

        return array_values(array_filter(
            self::cases(),
            fn(self $division) => in_array($division->value, $keys, true)
        ));
    }

    /**
     * Join division keys into the stored pageant type, in canonical order.
     *
     * @param  array<string>  $keys
     */
    public static function toType(array $keys): string
    {
        return implode('&', array_map(
            fn(self $division) => $division->value,
            self::fromType(implode('&', $keys))
        ));
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(fn(self $division) => $division->value, self::cases());
    }
}
