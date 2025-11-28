import { React, useState } from "react";
import "../style/category.css";
import { Link } from "react-router-dom";
import Modal from "react-modal/lib/components/Modal";
import "../style/viewmeds.css";

import { useSelector, useDispatch } from "react-redux";
import { Triangle } from "react-loader-spinner";
import StripCheckout from "react-stripe-checkout";
import Navbar from "./Navbar";

import {
  postMedFeedbackApi,
  postMedWishlistApi,
  placeOrderMedicineApi,
} from "../Data/Services/Oneforall";
import { toast } from "react-toastify";

// ⭐ New slider imports
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

Modal.setAppElement("#root");

const Viewmed = () => {
  // ======================================================== states
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [medBuyModal, setMedBuyModal] = useState(false);
  const [medicineItem, setMedicineItem] = useState(null);
  const [amount, setAmount] = useState();

  const token = useSelector((state) => state.userReducer).token;

  const _id = useSelector((state) => state.medicineReducer)._id;
  const medicineName = useSelector(
    (state) => state.medicineReducer
  ).medicineName;
  const medicineImage = useSelector(
    (state) => state.medicineReducer
  ).medicineImage;
  const medicinePrice = useSelector(
    (state) => state.medicineReducer
  ).medicinePrice;
  const manufacturerName = useSelector(
    (state) => state.medicineReducer
  ).manufacturerName;
  const availableStatus = useSelector(
    (state) => state.medicineReducer
  ).availableStatus;
  const medicineDescription = useSelector(
    (state) => state.medicineReducer
  ).medicineDescription;

  // =========================================================== functions
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

  const addMedtoWishlist = async () => {
    setModalIsOpen(true);
    const item = {
      _id,
      medicineName,
      medicineImage,
      medicinePrice,
      manufacturerName,
      availableStatus,
    };

    const response = await postMedWishlistApi(_id, item, token);
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

  const refresh = (e) => {
    e.preventDefault();
  };

  const takeInput = (e) => {
    setFeedback(e.target.value);
  };

  const postMedFeedback = async () => {
    if (feedback === "") {
      return toast.info("no input found! ", {
        theme: "dark",
        position: "bottom-right",
      });
    }

    setModalIsOpen(true);

    const data = { feedback, medicineId: _id, medicineName };

    const response = await postMedFeedbackApi(data, token);

    setModalIsOpen(false);
    setFeedback("");

    if (response.status === 200) {
      toast.success("feedback sent!", {
        theme: "colored",
        position: "bottom-right",
      });
    } else {
      toast.error("error occurred! try sometime later.", {
        theme: "colored",
        position: "bottom-right",
      });
    }
  };

  const takeMedicineItem = () => {
    const medicine = {
      _id,
      medicineName,
      medicinePrice,
      medicineImage,
      manufacturerName,
      availableStatus,
    };
    setMedicineItem(medicine);
    setAmount(medicinePrice);
  };

  const placeOrderMedicine = async () => {
    setModalIsOpen(true);

    const response = await placeOrderMedicineApi(medicineItem, token);

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

  const makePaymentMedicine = async (token) => {
    const { medicineName, medicinePrice } = medicineItem;

    const item = { name: medicineName, price: medicinePrice };

    const body = { token, item };

    return await fetch(`http://localhost:5500/paymentStripe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (response.status === 200) {
          placeOrderMedicine();
        }
      })
      .catch((error) => console.log("error:", error));
  };

  // ⭐ NEW SLIDER SETTINGS
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
          <div className="view-prod-slide">
            {/* ⭐ NEW SLIDER */}
            <Slider {...sliderSettings} className="slider">
              {medicineImage.map((img, idx) => (
                <div className="brand" id="img1" key={idx}>
                  <img src={img} alt="_img" />
                </div>
              ))}
            </Slider>
          </div>

          <div className="prod-detail">
            <section>{medicineName}</section>
            <section>₹{medicinePrice}</section>

            <section>
              {availableStatus ? (
                <p className="inStock">
                  <span className="green"></span> In Stock
                </p>
              ) : (
                <p className="outStock">
                  <span className="red"></span> Out of Stock
                </p>
              )}
            </section>

            <section>{manufacturerName}</section>
            <section style={{ width: "40vw" }}>{medicineDescription}</section>

            <section className="btn">
              <button onClick={addMedtoWishlist}>Add to Wishlist</button>

              <button
                onClick={() => {
                  setMedBuyModal(true);
                  takeMedicineItem();
                }}
              >
                Buy Now
              </button>

              {/* BUY MODAL */}
              <Modal isOpen={medBuyModal} style={customStyles}>
                <div className="buy-modal-container">
                  <div className="buy-modal-cancel">
                    <button onClick={() => setMedBuyModal(false)}>
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
                      onClick={() => setMedBuyModal(false)}
                    >
                      Cancel
                    </button>

                    <StripCheckout
                      stripeKey="pk_test_51K9BzESJxF1xgWl3hAPFSmTRUHtri2Vb2QmboXnSvvdcD0XaNuqwiUmdDJIwZ10VYHCdJskzHLJoERsFQS5mmUWD00leevPB9M"
                      token={makePaymentMedicine}
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

        {/* FEEDBACK */}
        <div className="view-prod-feedback">
          <form onSubmit={(e) => refresh(e)}>
            <p>Feedback of product</p>
            <textarea
              placeholder="write a review"
              name="feedback"
              onChange={takeInput}
            ></textarea>
            <button onClick={postMedFeedback}>review</button>
          </form>
        </div>
      </div>

      {/* GLOBAL LOADER */}
      <Modal isOpen={modalIsOpen} style={customStyles}>
        <div
          style={{
            width: "7vw",
            height: "13vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Triangle color="black" height={100} width={100} />
        </div>
      </Modal>
    </>
  );
};

export default Viewmed;
