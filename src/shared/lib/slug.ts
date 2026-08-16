// A client-minted crypto.randomUUID() output, e.g.
// "3fa85f64-5717-4562-b3fc-2c963f66afa6". Used both to validate the slug an
// admin's browser supplies on create and to recognise the format everywhere
// else a slug is read.
//
// Lowercase only, deliberately: crypto.randomUUID() never emits uppercase,
// and the duplicate check plus the R2 key it seeds are both case-sensitive.
// Accepting an uppercase variant here would let it slip past `slugExists` as
// a "different" id for what storage treats as the same prefix.
export const SLUG_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
