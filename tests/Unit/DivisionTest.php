<?php

namespace Tests\Unit;

use App\Enums\Division;
use PHPUnit\Framework\TestCase;

class DivisionTest extends TestCase
{
    public function test_legacy_types_parse_to_their_divisions(): void
    {
        $this->assertSame([Division::Mr], Division::fromType('mr'));
        $this->assertSame([Division::Ms], Division::fromType('ms'));
        $this->assertSame([Division::Mr, Division::Ms], Division::fromType('mr&ms'));
    }

    public function test_hiyas_combinations_parse(): void
    {
        $this->assertSame([Division::Hiyas], Division::fromType('hiyas'));
        $this->assertSame([Division::Ms, Division::Hiyas], Division::fromType('ms&hiyas'));
        $this->assertSame([Division::Mr, Division::Ms, Division::Hiyas], Division::fromType('mr&ms&hiyas'));
    }

    public function test_unknown_or_empty_types_parse_to_nothing(): void
    {
        $this->assertSame([], Division::fromType(null));
        $this->assertSame([], Division::fromType(''));
        $this->assertSame([Division::Mr], Division::fromType('mr&queen'));
    }

    public function test_to_type_uses_canonical_order_and_drops_duplicates(): void
    {
        $this->assertSame('mr&ms&hiyas', Division::toType(['hiyas', 'ms', 'mr']));
        $this->assertSame('ms&hiyas', Division::toType(['hiyas', 'ms', 'hiyas']));
        $this->assertSame('mr&ms', Division::toType(['ms', 'mr']));
    }

    public function test_labels(): void
    {
        $this->assertSame('Mr.', Division::Mr->label());
        $this->assertSame('Ms.', Division::Ms->label());
        $this->assertSame('Hiyas', Division::Hiyas->label());
    }
}
