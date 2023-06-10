import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addToDb,
  deleteShoppingCart,
  getStoredCart,
} from "../../utilities/fakedb";
import Cart from "../Cart/Cart";
import Product from "../Product/Product";
import "./Shop.css";

const Shop = () => {
  // console.log(count);
  const [cart, setCart] = useState([]);

  const [limit, setLimit] = useState(10);
  const [count, setCount] = useState(0);
  const [totalPage, setTotalPage] = useState(Math.ceil(count / limit));
  const [currentPage, setCurrentPage] = useState(0);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(
      `http://localhost:5000/products?currentPage=${currentPage}&limit=${limit}`
    )
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products);
        setTotalPage(Math.ceil(count / limit));
        setCount(data.count);
      });
  }, [count, currentPage, limit]);

  const clearCart = () => {
    setCart([]);
    deleteShoppingCart();
  };

  useEffect(() => {
    const storedCart = getStoredCart();
    const savedCart = [];
    for (const id in storedCart) {
      const addedProduct = products.find((product) => product._id === id);
      if (addedProduct) {
        const quantity = storedCart[id];
        addedProduct.quantity = quantity;
        savedCart.push(addedProduct);
      }
    }
    setCart(savedCart);
  }, [products]);

  const handleAddToCart = (selectedProduct) => {
    console.log(selectedProduct);
    let newCart = [];
    const exists = cart.find((product) => product._id === selectedProduct._id);
    if (!exists) {
      selectedProduct.quantity = 1;
      newCart = [...cart, selectedProduct];
    } else {
      const rest = cart.filter(
        (product) => product._id !== selectedProduct._id
      );
      exists.quantity = exists.quantity + 1;
      newCart = [...rest, exists];
    }

    setCart(newCart);
    addToDb(selectedProduct._id);
  };

  return (
    <div className="shop-container">
      <div className="">
        <div className="products-container">
          {products?.map((product) => (
            <Product
              key={product._id}
              product={product}
              handleAddToCart={handleAddToCart}
            ></Product>
          ))}
        </div>
        <div className="pagenation" style={{ width: "80%", margin: "0 auto" }}>
          <h3>Pagenation</h3>
          <div className="pagenations-buttons">
            {[...Array(totalPage).keys()].map((p) => (
              <button
                key={p}
                className={currentPage === p ? "selected" : ""}
                onClick={() => setCurrentPage(p)}
              >
                {p + 1}
              </button>
            ))}
            <div className="per-page-products">
              <span>Products per page: </span>
              <select
                name="perPage"
                id="perPage"
                onChange={(e) => {
                  setLimit(parseInt(e.target.value));
                  setCurrentPage(0);
                }}
                defaultValue={limit}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="cart-container">
        <Cart clearCart={clearCart} cart={cart}>
          <Link to="/orders">
            <button>Review Order</button>
          </Link>
        </Cart>
      </div>
    </div>
  );
};

export default Shop;
