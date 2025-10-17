// app/page.tsx
"use client";

import { useState } from "react";

type Category = "skincare" | "makeup";

type ProductCategory =
  | "Cleanser"
  | "Toner"
  | "Serum"
  | "Moisturizer"
  | "Sunscreen"
  | "Eye Cream"
  | "Foundation"
  | "Concealer"
  | "Powder"
  | "Blush"
  | "Bronzer"
  | "Highlighter"
  | "Eyeshadow"
  | "Eyeliner"
  | "Mascara"
  | "Brow Product"
  | "Lipstick"
  | "Lip Gloss";

type Retailer = "Sephora" | "Olive Young" | "Ulta" | "YesStyle" | "Other";

interface Product {
  id: string;
  category: ProductCategory;
  brand: string;
  name: string;
  price: number;
  shade?: string;
  notes?: string;
  retailer: Retailer;
  productUrl?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
}

const skincareCategories: ProductCategory[] = [
  "Cleanser",
  "Toner",
  "Serum",
  "Moisturizer",
  "Sunscreen",
  "Eye Cream",
];

const makeupCategories: ProductCategory[] = [
  "Foundation",
  "Concealer",
  "Powder",
  "Blush",
  "Bronzer",
  "Highlighter",
  "Eyeshadow",
  "Eyeliner",
  "Mascara",
  "Brow Product",
  "Lipstick",
  "Lip Gloss",
];

const retailers: Retailer[] = [
  "Sephora",
  "Olive Young",
  "Ulta",
  "YesStyle",
  "Other",
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Category>("skincare");
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRetailer, setFilterRetailer] = useState<Retailer | "All">("All");
  const [formData, setFormData] = useState({
    category: "" as ProductCategory | "",
    brand: "",
    name: "",
    price: "",
    shade: "",
    notes: "",
    retailer: "Sephora" as Retailer,
    productUrl: "",
    imageUrl: "",
    rating: "",
    reviewCount: "",
  });

  const categories =
    activeTab === "skincare" ? skincareCategories : makeupCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.category ||
      !formData.brand ||
      !formData.name ||
      !formData.price
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const product: Product = {
      id: editingId || Date.now().toString(),
      category: formData.category as ProductCategory,
      brand: formData.brand,
      name: formData.name,
      price: parseFloat(formData.price),
      shade: formData.shade || undefined,
      notes: formData.notes || undefined,
      retailer: formData.retailer,
      productUrl: formData.productUrl || undefined,
      imageUrl: formData.imageUrl || undefined,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      reviewCount: formData.reviewCount
        ? parseInt(formData.reviewCount)
        : undefined,
    };

    if (editingId) {
      setProducts(products.map((p) => (p.id === editingId ? product : p)));
      setEditingId(null);
    } else {
      setProducts([...products, product]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      category: "",
      brand: "",
      name: "",
      price: "",
      shade: "",
      notes: "",
      retailer: "Sephora",
      productUrl: "",
      imageUrl: "",
      rating: "",
      reviewCount: "",
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      category: product.category,
      brand: product.brand,
      name: product.name,
      price: product.price.toString(),
      shade: product.shade || "",
      notes: product.notes || "",
      retailer: product.retailer,
      productUrl: product.productUrl || "",
      imageUrl: product.imageUrl || "",
      rating: product.rating?.toString() || "",
      reviewCount: product.reviewCount?.toString() || "",
    });
    setEditingId(product.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `beauty-list-${Date.now()}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          setProducts(imported);
          alert("Products imported successfully!");
        } catch (error) {
          alert("Error importing file. Please check the format.");
        }
      };
      reader.readAsText(file);
    }
  };

  // Filter products based on active tab first, then apply search and retailer filters
  const tabFilteredProducts = products.filter((p) => {
    const categoryList =
      activeTab === "skincare" ? skincareCategories : makeupCategories;
    return categoryList.includes(p.category);
  });

  const filteredProducts = tabFilteredProducts.filter((p) => {
    const matchesSearch =
      searchQuery === "" ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRetailer =
      filterRetailer === "All" || p.retailer === filterRetailer;
    return matchesSearch && matchesRetailer;
  });

  const totalPrice = filteredProducts.reduce((sum, p) => sum + p.price, 0);

  const productsByCategory = categories.map((cat) => ({
    category: cat,
    products: filteredProducts.filter((p) => p.category === cat),
  }));

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? "text-yellow-400" : "text-gray-300"}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Beauty List Builder
          </h1>
          <p className="text-gray-600">
            Create your perfect skincare routine or makeup collection
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setActiveTab("skincare")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "skincare"
                ? "bg-pink-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Skincare
          </button>
          <button
            onClick={() => setActiveTab("makeup")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "makeup"
                ? "bg-purple-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Makeup
          </button>

          {/* Export/Import */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-3 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Export List
            </button>
            <label className="px-4 py-3 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all cursor-pointer">
              Import List
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search by brand, product name, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <select
              value={filterRetailer}
              onChange={(e) =>
                setFilterRetailer(e.target.value as Retailer | "All")
              }
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="All">All Retailers</option>
              {retailers.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
          {(searchQuery || filterRetailer !== "All") && (
            <div className="mt-2 text-sm text-gray-600">
              Showing {filteredProducts.length} of {tabFilteredProducts.length}{" "}
              products
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Product List */}
          <div className="lg:col-span-2 space-y-4">
            {productsByCategory.map(({ category, products: catProducts }) => (
              <div key={category} className="bg-white rounded-lg shadow-md p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {category}
                </h3>

                {catProducts.length === 0 ? (
                  <p className="text-gray-400 text-sm">No products added</p>
                ) : (
                  <div className="space-y-3">
                    {catProducts.map((product) => (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-pink-300 transition-colors"
                      >
                        <div className="flex gap-4">
                          {/* Product Image */}
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-20 h-20 object-cover rounded"
                            />
                          )}

                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">
                                  {product.brand} - {product.name}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                                    {product.retailer}
                                  </span>
                                </div>
                                {product.shade && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    Shade: {product.shade}
                                  </div>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <div className="font-semibold text-gray-900 text-lg">
                                  ${product.price.toFixed(2)}
                                </div>
                              </div>
                            </div>

                            {/* Rating */}
                            {product.rating && (
                              <div className="flex items-center gap-2 mb-2">
                                {renderStars(product.rating)}
                                <span className="text-sm text-gray-600">
                                  {product.rating.toFixed(1)}
                                  {product.reviewCount &&
                                    ` (${product.reviewCount} reviews)`}
                                </span>
                              </div>
                            )}

                            {product.notes && (
                              <div className="text-sm text-gray-500 mb-2">
                                {product.notes}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 mt-2">
                              {product.productUrl && (
                                <a
                                  href={product.productUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  View Product →
                                </a>
                              )}
                              <button
                                onClick={() => handleEdit(product)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Total Price */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Total Cost
              </h3>
              <div className="text-3xl font-bold text-pink-600">
                ${totalPrice.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {filteredProducts.length} products
              </div>

              {/* Retailer Breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  By Retailer
                </h4>
                {retailers.map((retailer) => {
                  const count = filteredProducts.filter(
                    (p) => p.retailer === retailer
                  ).length;
                  const total = filteredProducts
                    .filter((p) => p.retailer === retailer)
                    .reduce((sum, p) => sum + p.price, 0);
                  if (count === 0) return null;
                  return (
                    <div
                      key={retailer}
                      className="flex justify-between text-sm text-gray-600 mb-1"
                    >
                      <span>{retailer}:</span>
                      <span>
                        ${total.toFixed(2)} ({count})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Product Button */}
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
              >
                + Add Product
              </button>
            )}

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="bg-white rounded-lg shadow-md p-5 max-h-[600px] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {editingId ? "Edit Product" : "Add Product"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Retailer *
                    </label>
                    <select
                      value={formData.retailer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          retailer: e.target.value as Retailer,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    >
                      {retailers.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as ProductCategory,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand *
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g., The Ordinary, Fenty Beauty"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g., Niacinamide 10% + Zinc 1%"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="29.99"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product URL
                    </label>
                    <input
                      type="url"
                      value={formData.productUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, productUrl: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating (0-5)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.rating}
                        onChange={(e) =>
                          setFormData({ ...formData, rating: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="4.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reviews
                      </label>
                      <input
                        type="number"
                        value={formData.reviewCount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            reviewCount: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="1234"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shade/Color
                    </label>
                    <input
                      type="text"
                      value={formData.shade}
                      onChange={(e) =>
                        setFormData({ ...formData, shade: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g., 310 Medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      rows={2}
                      placeholder="Personal notes, skin type, usage tips..."
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-pink-500 text-white py-2 rounded font-semibold hover:bg-pink-600 transition-colors"
                    >
                      {editingId ? "Update" : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
