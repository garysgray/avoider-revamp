// ============================================================================
// CollisionUtilities.js
// Pure collision math — no game state, no side effects.
// Used for broad-phase and narrow-phase collision checks.
// ============================================================================

// ---- AABB Collision ---------------------------------------------------------

// Returns true if two axis-aligned bounding boxes overlap.
// Expects boxes with { left, right, top, bottom } from getHitbox().
function rectsCollide(a, b)
{
    if (!a || !b) return false;
    return !(
        a.right  < b.left  ||
        a.left   > b.right ||
        a.bottom < b.top   ||
        a.top    > b.bottom
    );
}


// ---- Broad-Phase Check ------------------------------------------------------

// Returns true if two objects are close enough to warrant a precise hitbox check.
// Uses squared distance to avoid sqrt — cheaper than rectsCollide for early-out.
// pad expands the check radius for looser proximity tests.
function roughNear(a, b, pad = 0)
{
    if (!a || !b) return false;
    const dx = a.posX - b.posX;
    const dy = a.posY - b.posY;
    const r  = a.getRoughRadius() + b.getRoughRadius() + pad;
    return (dx * dx + dy * dy) <= (r * r);
}