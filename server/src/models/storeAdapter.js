import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'db_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Collection {
  constructor(name, initialData = []) {
    this.name = name;
    this.data = initialData;
  }

  _save() {
    try {
      globalStore.persist();
    } catch (e) {
      console.error('Store persist error:', e);
    }
  }

  async countDocuments(filter = {}) {
    if (!filter || Object.keys(filter).length === 0) {
      return this.data.length;
    }
    return this.data.filter(item => this._matches(item, filter)).length;
  }

  async deleteMany(filter = {}) {
    if (!filter || Object.keys(filter).length === 0) {
      const count = this.data.length;
      this.data = [];
      this._save();
      return { acknowledged: true, deletedCount: count };
    }
    const initialLen = this.data.length;
    this.data = this.data.filter(item => !this._matches(item, filter));
    const deletedCount = initialLen - this.data.length;
    this._save();
    return { acknowledged: true, deletedCount };
  }

  async insertMany(items) {
    const prepared = items.map(item => {
      const doc = {
        _id: item._id || `${this.name}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        createdAt: item.createdAt || new Date(),
        updatedAt: item.updatedAt || new Date(),
        ...item
      };
      return this._wrapDoc(doc);
    });
    this.data.push(...prepared.map(d => d.toObject()));
    this._save();
    return prepared;
  }

  find(filter = {}) {
    let results = this.data.filter(item => this._matches(item, filter));
    return new QueryBuilder(results.map(r => this._wrapDoc(r)));
  }

  findOne(filter = {}) {
    const item = this.data.find(item => this._matches(item, filter));
    return new SingleQueryBuilder(item ? this._wrapDoc(item) : null);
  }

  async findOneAndUpdate(filter, update, options = {}) {
    const index = this.data.findIndex(item => this._matches(item, filter));
    if (index === -1) return null;

    let target = { ...this.data[index] };

    if (update.$inc) {
      for (const [key, incVal] of Object.entries(update.$inc)) {
        target[key] = (target[key] || 0) + incVal;
      }
    }

    if (update.$set) {
      Object.assign(target, update.$set);
    }

    // Direct field updates
    for (const [k, v] of Object.entries(update)) {
      if (!k.startsWith('$')) {
        target[k] = v;
      }
    }

    target.updatedAt = new Date();
    this.data[index] = target;
    this._save();
    return this._wrapDoc(target);
  }

  async findOneAndDelete(filter) {
    const index = this.data.findIndex(item => this._matches(item, filter));
    if (index === -1) return null;
    const deleted = this.data.splice(index, 1)[0];
    this._save();
    return this._wrapDoc(deleted);
  }

  _matches(item, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;

    for (const [key, value] of Object.entries(filter)) {
      if (key === '$or' && Array.isArray(value)) {
        const matchesOr = value.some(subFilter => this._matches(item, subFilter));
        if (!matchesOr) return false;
        continue;
      }

      const itemVal = item[key];

      if (value instanceof RegExp) {
        if (!value.test(String(itemVal || ''))) return false;
      } else if (value && typeof value === 'object' && value.$regex) {
        const reg = new RegExp(value.$regex, value.$options || 'i');
        if (!reg.test(String(itemVal || ''))) return false;
      } else if (value && typeof value === 'object' && value.$gte) {
        if (new Date(itemVal) < new Date(value.$gte)) return false;
      } else if (value && typeof value === 'object' && value.$lte) {
        if (new Date(itemVal) > new Date(value.$lte)) return false;
      } else if (itemVal !== value) {
        return false;
      }
    }
    return true;
  }

  _wrapDoc(raw) {
    const self = this;
    const doc = { ...raw };

    // Virtual getters for Product
    Object.defineProperty(doc, 'stockStatus', {
      get() {
        if (doc.currentStock === 0) return 'out_of_stock';
        if (doc.currentStock <= (doc.minStockLevel || 15)) return 'low_stock';
        if (doc.currentStock >= (doc.maxStockLevel || 150)) return 'overstocked';
        return 'optimal';
      },
      enumerable: true
    });

    Object.defineProperty(doc, 'grossMarginPercent', {
      get() {
        if (!doc.unitPrice || doc.unitPrice === 0) return 0;
        return Number((((doc.unitPrice - doc.unitCost) / doc.unitPrice) * 100).toFixed(1));
      },
      enumerable: true
    });

    doc.toObject = () => ({ ...doc });
    doc.toJSON = () => ({ ...doc });

    doc.save = async function() {
      const idx = self.data.findIndex(d => (d._id && d._id === doc._id) || (d.sku && d.sku === doc.sku) || (d.orderNumber && d.orderNumber === doc.orderNumber) || (d.saleId && d.saleId === doc.saleId));
      if (idx !== -1) {
        self.data[idx] = { ...doc };
      } else {
        self.data.push({ ...doc });
      }
      self._save();
      return doc;
    };

    return doc;
  }
}

class QueryBuilder {
  constructor(data) {
    this.results = [...data];
    this.isLean = false;
  }

  sort(sortParam) {
    if (!sortParam) return this;
    let field = sortParam;
    let desc = false;

    if (typeof sortParam === 'object') {
      const entries = Object.entries(sortParam);
      if (entries.length > 0) {
        field = entries[0][0];
        desc = entries[0][1] === -1;
      }
    } else if (typeof sortParam === 'string') {
      if (sortParam.startsWith('-')) {
        field = sortParam.slice(1);
        desc = true;
      }
    }

    this.results.sort((a, b) => {
      const valA = a[field];
      const valB = b[field];
      if (valA === valB) return 0;
      if (valA === undefined) return 1;
      if (valB === undefined) return -1;
      if (desc) return valA > valB ? -1 : 1;
      return valA > valB ? 1 : -1;
    });

    return this;
  }

  limit(count) {
    this.results = this.results.slice(0, count);
    return this;
  }

  lean() {
    this.isLean = true;
    return this;
  }

  then(resolve, reject) {
    const output = this.isLean
      ? this.results.map(r => (typeof r.toObject === 'function' ? r.toObject() : r))
      : this.results;
    return Promise.resolve(output).then(resolve, reject);
  }
}

class SingleQueryBuilder {
  constructor(item) {
    this.item = item;
    this.isLean = false;
  }

  lean() {
    this.isLean = true;
    return this;
  }

  populate() {
    return this;
  }

  then(resolve, reject) {
    if (!this.item) return Promise.resolve(null).then(resolve, reject);
    const result = this.isLean && typeof this.item.toObject === 'function'
      ? this.item.toObject()
      : this.item;
    return Promise.resolve(result).then(resolve, reject);
  }
}

class GlobalStore {
  constructor() {
    this.collections = {
      Product: new Collection('Product'),
      Sale: new Collection('Sale'),
      PurchaseOrder: new Collection('PurchaseOrder'),
      User: new Collection('User')
    };
    this.load();
  }

  load() {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.Product) this.collections.Product.data = parsed.Product;
        if (parsed.Sale) this.collections.Sale.data = parsed.Sale;
        if (parsed.PurchaseOrder) this.collections.PurchaseOrder.data = parsed.PurchaseOrder;
        if (parsed.User) this.collections.User.data = parsed.User;
        console.log(`📂 Loaded persisted store (${this.collections.Product.data.length} products, ${this.collections.Sale.data.length} sales)`);
      } catch (e) {
        console.warn('Could not read existing store file, initializing fresh store.');
      }
    }
  }

  persist() {
    try {
      const payload = {
        Product: this.collections.Product.data,
        Sale: this.collections.Sale.data,
        PurchaseOrder: this.collections.PurchaseOrder.data,
        User: this.collections.User.data,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error persisting db_store:', e);
    }
  }
}

export const globalStore = new GlobalStore();

export function createModelAdapter(modelName) {
  const collection = globalStore.collections[modelName];

  function ModelConstructor(data) {
    return collection._wrapDoc({
      _id: `${modelName}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    });
  }

  ModelConstructor.find = (filter) => collection.find(filter);
  ModelConstructor.findOne = (filter) => collection.findOne(filter);
  ModelConstructor.findOneAndUpdate = (filter, update, options) => collection.findOneAndUpdate(filter, update, options);
  ModelConstructor.findOneAndDelete = (filter) => collection.findOneAndDelete(filter);
  ModelConstructor.countDocuments = () => collection.countDocuments();
  ModelConstructor.deleteMany = (filter) => collection.deleteMany(filter);
  ModelConstructor.insertMany = (items) => collection.insertMany(items);

  return ModelConstructor;
}
