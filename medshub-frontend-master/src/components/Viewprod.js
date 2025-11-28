import { React, useState } from "react";
import { Link } from "react-router-dom";
import "../style/viewprod.css";
import Navbar from "./Navbar";
import {
  postProdFeedbackApi,
  postprodWishlistApi,
  placeOrderProductApi,
} from "../Data/Services/Oneforall";
import Modal from "react-modal/lib/components/Modal";
import { Triangle } from "react-loader-spinner";
import StripCheckout from "react-stripe-checkout";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

// ⭐ NEW SLIDER (react-slick instead of @brainhubeu/react-carousel)
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

Modal.setAppElement("#root");

const Viewprod = () => {
  // ================================== STATES
  const _id = useSelector((state) => state.productReducer)._id;
  const productName = useSelector((state) => state.productReducer).productName;
  const productImage = useSelector(
    (state) => state.productReducer
  ).productImage;
  const productBrand = useSelector(
    (state) => state.productReducer
  ).productBrand;
  const productCategory = useSelector(
    (state) => state.productReducer
  ).productCategory;
  const productPrice = useSelector(
    (state) => state.productReducer
  ).productPrice;
  const productStatus = useSelector(
    (state) => state.productReducer
  ).availableStatus;
  const productDescription = useSelector(
    (state) => state.productReducer
  ).productDescription;

  const token = useSelector((state) => state.userReducer).token;

  const prodItem = {
    _id,
    productName,
    productImage,
    productBrand,
    productCategory,
    productPrice,
    productStatus,
    productDescription,
  };

  const [feedback, setFeedback] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [prodBuyModal, setProdBuyModal] = useState(false);
  const [productItem, setProductItem] = useState(null);
  const [amount, setAmount] = useState();

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      border: "1px solid black",
    },
  };

  // =========================================== FUNCTIONS
  const addProdtoWishlist = async () => {
    setModalIsOpen(true);

    const item = {
      _id,
      productName,
      productImage,
      productBrand,
      productCategory,
      productDescription,
      productPrice,
      productStatus,
    };

    const response = await postprodWishlistApi(_id, item, token);
    setModalIsOpen(false);

    if (response.status === 200 && response.data.status === "200") {
      toast.success("added to wishlist!", {
        position: "bottom-right",
        theme: "dark",
      });
    } else if (response.data.error?.code === 400) {
      toast.info("already exist in wishlist!", {
        position: "bottom-right",
        theme: "dark",
      });
    } else {
      toast.error("error occurred! try again later", {
        position: "bottom-right",
        theme: "dark",
      });
    }
  };

  const takeInput = (e) => setFeedback(e.target.value);

  const sendProdFeedback = async () => {
    if (feedback === "") {
      return toast.info("no input found!", {
        theme: "dark",
        position: "bottom-right",
      });
    }

    setModalIsOpen(true);

    const data = { feedback, _id, productName, productBrand };
    const response = await postProdFeedbackApi(data, token);

    setModalIsOpen(false);
    setFeedback("");

    if (response.status === 200) {
      toast.success("feedback sent!", {
        theme: "colored",
        position: "bottom-right",
      });
    } else {
      toast.error("error occurred! try again later.", {
        theme: "colored",
        position: "bottom-right",
      });
    }
  };

  const takeProductItem = (item) => {
    setProductItem(item);
    setAmount(item.productPrice);
  };

  const placeOrderProduct = async () => {
    setModalIsOpen(true);

    const response = await placeOrderProductApi(productItem, token);

    setModalIsOpen(false);

    if (response.status === 200 && response.data.status === "200") {
      toast.success("order placed!", {
        position: "top-right",
        theme: "dark",
      });
    } else {
      toast.error("error occurred! try again later", {
        position: "top-right",
        theme: "dark",
      });
    }
  };

  const makePaymentProduct = async (token) => {
    const { productName, productPrice } = productItem;

    const item = { name: productName, price: productPrice };

    const body = { token, item };

    return await fetch(`http://localhost:5500/paymentStripe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (response.status === 200) placeOrderProduct();
      })
      .catch((error) => console.log("error:", error));
  };

  // ⭐ New slider settings
  const sliderSettings = {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: true,
    speed: 800,
    centerMode: true,
    centerPadding: "0px",
  };

  return (
    <>
      <Navbar />

      <div className="view">
        <div className="view-prod">
          {/* PRODUCT IMAGE SLIDER */}
          <div className="view-prod-slide">
            <Slider {...sliderSettings} className="slider">
              {productImage.map((img, idx) => (
                <div className="brand" key={idx}>
                  <img src={img} alt="product" />
                </div>
              ))}
            </Slider>
          </div>

          {/* PRODUCT DETAILS */}
          <div className="prod-detail">
            <section>{productName}</section>

            <section>
              {productStatus ? (
                <p className="inStock">
                  <span className="green"></span> In Stock
                </p>
              ) : (
                <p className="outStock">
                  <span className="red"></span> Out of Stock
                </p>
              )}
            </section>

            <section className="product-info-row">
              <p>{productCategory}</p>
              <p>{productBrand}</p>
              <p>₹{productPrice}</p>
            </section>

            <section className="product-description">{productDescription}</section>

            {/* ACTION BUTTONS */}
            <section className="btn">
              <button onClick={addProdtoWishlist}>Add to Wishlist</button>

              <button
                className="buynow"
                onClick={() => {
                  setProdBuyModal(true);
                  takeProductItem(prodItem);
                }}
              >
                Buy Now
              </button>

              {/* BUY MODAL */}
              <Modal isOpen={prodBuyModal} style={customStyles}>
                <div className="buy-modal-container">
                  <div className="buy-modal-cancel">
                    <button onClick={() => setProdBuyModal(false)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  <div className="buy-modal-body">
                    <p>
                      Are you sure <br />
                      you want to buy now?
                    </p>
                  </div>

                  <div className="buy-modal-btn">
                    <button
                      className="no"
                      onClick={() => setProdBuyModal(false)}
                    >
                      Cancel
                    </button>

                    <StripCheckout
                      stripeKey="pk_test_51K9BzESJxF1xgWl3hAPFSmTRUHtri2Vb2QmboXnSvvdcD0XaNuqwiUmdDJIwZ10VYHCdJskzHLJoERsFQS5mmUWD00leevPB9M"
                      token={makePaymentProduct}
                      name="Make Payment"
                      shippingAddress
                      billingAddress
                    >
                      <button className="yes">pay ₹{amount}</button>
                    </StripCheckout>
                  </div>
                </div>
              </Modal>
            </section>
          </div>
        </div>

        {/* FEEDBACK SECTION */}
        <div className="view-prod-feedback">
          <form onSubmit={(e) => e.preventDefault()}>
            <p>Feedback of product</p>
            <textarea
              placeholder="write a review"
              rows="10"
              value={feedback}
              onChange={takeInput}
            ></textarea>
            <button onClick={sendProdFeedback}>send review</button>
          </form>
        </div>
      </div>

      {/* GLOBAL LOADING MODAL */}
      <Modal isOpen={modalIsOpen} style={customStyles}>
        <div className="loader-container">
          <Triangle color="black" height={100} width={100} />
        </div>
      </Modal>
    </>
  );
};

export default Viewprod;
