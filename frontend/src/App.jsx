import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Cart from "./Cart";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    price: "",
    imageUrl: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationError, setValidationError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("products"); // 'products' or 'cart'
  const [cartCount, setCartCount] = useState(0);

  // Auto-dismiss alerts
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/products`, { withCredentials: true });
      setProducts(res.data);
      setError("");
    } catch {
      setError("Failed to fetch products");
    }
    setLoading(false);
  };

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/cart`);
      setCartCount(res.data.reduce((sum, item) => sum + item.quantity, 0));
    } catch {
      console.error("Failed to fetch cart count");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setValidationError("");
  };

  // Create or update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    // Validate price and quantity
    if (Number(form.price) <= 0 || Number(form.quantity) <= 0) {
      setValidationError("Price and quantity must be greater than zero");
      return;
    }

    try {
      const formData = {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
      };

      if (editingId) {
        await axios.put(`${API_URL}/api/products/${editingId}`, formData, {
          withCredentials: true,
        });
        setSuccess("Product updated successfully!");
        setEditingId(null);
      } else {
        await axios.post(`${API_URL}/api/products`, formData, { withCredentials: true });
        setSuccess("Product added successfully!");
      }
      setForm({ name: "", quantity: "", price: "", imageUrl: "" });
      fetchProducts();
      setValidationError("");
    } catch {
      setError("Failed to save product");
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setForm({
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      imageUrl: product.imageUrl || "",
    });
    setEditingId(product._id);
    setValidationError("");
    setSuccess("");
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/api/products/${id}`, { withCredentials: true });
      fetchProducts();
      setSuccess("Product deleted successfully!");
      setError("");
    } catch {
      setError("Failed to delete product");
    }
  };

  // Add to cart
  const handleAddToCart = async (product, quantity = 1) => {
    try {
      await axios.post(`${API_URL}/api/cart`, {
        productId: product._id,
        quantity
      });
      fetchCartCount();
      setSuccess(`${product.name} added to cart!`);
    } catch {
      setError("Failed to add to cart");
    }
  };

  // Handle sorting
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Apply sorting and filtering to products
  const sortedAndFilteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.price.toString().includes(searchTerm) ||
        product.quantity.toString().includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortField === "createdAt" || sortField === "updatedAt") {
        const dateA = new Date(a[sortField]);
        const dateB = new Date(b[sortField]);
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortField === "price" || sortField === "quantity") {
        return sortDirection === "asc"
          ? a[sortField] - b[sortField]
          : b[sortField] - a[sortField];
      } else {
        return sortDirection === "asc"
          ? a[sortField].localeCompare(b[sortField])
          : b[sortField].localeCompare(a[sortField]);
      }
    });

  // Pagination
  const totalItems = sortedAndFilteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAndFilteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const getSortIndicator = (field) => {
    if (sortField === field) {
      return sortDirection === "asc" ? " ↑" : " ↓";
    }
    return "";
  };

  return (
    <div className="container">
      <nav className="nav-bar">
        <h1>E-Commerce Shop</h1>
        <div className="nav-buttons">
          <button 
            className={view === "products" ? "active" : ""}
            onClick={() => setView("products")}
          >
            Products
          </button>
          <button 
            className={view === "cart" ? "active" : ""}
            onClick={() => setView("cart")}
          >
            Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {view === "cart" ? (
        <Cart onCartUpdate={fetchCartCount} />
      ) : (
        <>
      <h2>Product Management</h2>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {validationError && (
        <div className="alert alert-error">{validationError}</div>
      )}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-inputs-row">
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              name="quantity"
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              required
              min="1"
              step="1"
            />
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              required
              min="1"
              step="1"
            />
            <input
              name="imageUrl"
              placeholder="Image URL"
              value={form.imageUrl}
              onChange={handleChange}
            />
          </div>

          <div className="form-buttons-row">
            <button type="submit">
              {editingId ? "Update" : "Add"} Product
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: "", quantity: "", price: "", imageUrl: "" });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading products...
        </div>
      ) : sortedAndFilteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">□</div>
          <h3>No Products Found</h3>
          <p>Add your first product using the form above.</p>
        </div>
      ) : (
        <>
        <div className="product-table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th
                  className="col-name sortable"
                  onClick={() => handleSort("name")}
                >
                  Name{getSortIndicator("name")}
                </th>
                <th
                  className="col-quantity sortable"
                  onClick={() => handleSort("quantity")}
                >
                  Quantity{getSortIndicator("quantity")}
                </th>
                <th
                  className="col-price sortable"
                  onClick={() => handleSort("price")}
                >
                  Price{getSortIndicator("price")}
                </th>
                <th
                  className="col-date sortable"
                  onClick={() => handleSort("createdAt")}
                >
                  Date{getSortIndicator("createdAt")}
                </th>
                <th className="col-image">Image</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((product) => (
                <tr key={product._id}>
                  <td className="col-name">{product.name}</td>
                  <td className="col-quantity">{product.quantity}</td>
                  <td className="col-price">
                    ₹{parseFloat(product.price).toFixed(2)}
                  </td>
                  <td className="col-date">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="col-image">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{ width: 50 }}
                      />
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="col-actions">
                    <button 
                      onClick={() => handleAddToCart(product)} 
                      className="add-to-cart"
                    >
                      + Add to Cart
                    </button>
                    <button onClick={() => handleEdit(product)}>Edit</button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                &laquo; Previous
              </button>

              <div className="pagination-pages">
                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => goToPage(number)}
                    className={`pagination-button ${
                      currentPage === number ? "active" : ""
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next &raquo;
              </button>
            </div>
          )}

          <div className="pagination-info">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, totalItems)} of {totalItems} products
          </div>
        </>
      )}
      </>
      )}
    </div>
  );
}

export default App;
