// ============================================================================
// ObjHolder.js
// Generic collection class for managing game objects.
// Maintains an unordered list for fast lookup and an ordered list for rendering.
// ============================================================================

class ObjHolder
{
    #objects     = [];    // primary collection — used for logic and lookup
    #orderedList = [];    // secondary list — used for ordered rendering passes

    // Adds an object to both lists by default.
    // Pass addToOrder = false to exclude from the render order list.
    addObject(obj, addToOrder = true)
    {
        this.#objects.push(obj);
        if (addToOrder) this.#orderedList.push(obj);
    }

    // Removes an object by index from both lists
    subObject(index)
    {
        const obj = this.#objects[index];
        if (!obj) return;

        this.#objects.splice(index, 1);

        const i = this.#orderedList.indexOf(obj);
        if (i >= 0) this.#orderedList.splice(i, 1);
    }

    // Removes all objects from both lists
    clearObjects()          { this.#objects = []; this.#orderedList = []; }

    // Returns the object at the given index
    getIndex(index)         { return this.#objects[index]; }

    // Returns the total number of objects
    getSize()               { return this.#objects.length; }

    // Finds and returns the first object with a matching name
    getObjectByName(name)   { return this.#objects.find(o => o.name === name); }

    // Convenience helper — returns the image property of a named object, or null
    getImage(name)          { return this.getObjectByName(name)?.image ?? null; }

    // Iterates over all objects with the given callback
    forEach(cb)             { if (typeof cb === "function") this.#objects.forEach(cb); }

    // Overrides the render order list — only accepts objects already in the collection
    setOrder(arr)
    {
        if (Array.isArray(arr)) this.#orderedList = arr.filter(o => this.#objects.includes(o));
    }
}