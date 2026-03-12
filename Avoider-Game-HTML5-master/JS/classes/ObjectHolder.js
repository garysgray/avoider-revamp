// ============================================================================
//  OBJECTHOLDER CLASS 
// ============================================================================

class ObjHolder
{
    #objects     = [];
    #orderedList = [];

    addObject(obj, addToOrder = true)
    {
        this.#objects.push(obj);
        if (addToOrder) this.#orderedList.push(obj);
    }

    subObject(index)
    {
        const obj = this.#objects[index];
        if (!obj) return;
        this.#objects.splice(index, 1);
        const i = this.#orderedList.indexOf(obj);
        if (i >= 0) this.#orderedList.splice(i, 1);
    }

    clearObjects()        { this.#objects = []; this.#orderedList = []; }
    getIndex(index)       { return this.#objects[index]; }
    getSize()             { return this.#objects.length; }
    getObjectByName(name) { return this.#objects.find(o => o.name === name); }
    getImage(name)        { return this.getObjectByName(name)?.image ?? null; }
    forEach(cb)           { if (typeof cb === "function") this.#objects.forEach(cb); }

    setOrder(arr)
    {
        if (Array.isArray(arr)) this.#orderedList = arr.filter(o => this.#objects.includes(o));
    }
}
