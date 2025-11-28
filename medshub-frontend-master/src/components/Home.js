import { React, useEffect, useRef, useState } from "react";
import "../style/home.css";

// Brand images
import dabur from "../images/dabur-banner.jfif";
import dettol from "../images/dettol-banner.jpg";
import garnier from "../images/garnier-banner.jpg";
import himalya from "../images/himalya-banner.jfif";
import mamaearth from "../images/mamaearth-banner.jfif";
import muscleblaze from "../images/muscleblaze-banner.jfif";
import zandu from "../images/zandu-banner.jfif";

// Category images
import sanitizer from "../images/sanitizer.png";
import babies from "../images/babies.png";
import fitness from "../images/fitness.jpg";
import devices from "../images/devies.jpg";

// Beauty images
import facialkit from "../images/facial-kit.png";
import haircare from "../images/haircare.jfif";
import lipcare from "../images/lipcare.jpg";
import bodycare from "../images/bodycare.jpg";

// Men's grooming
import beardoil from "../images/beardoil.jpg";
import beardwash from "../images/beardwash.jfif";
import hairgel from "../images/hairgel.jpg";
import mendeo from "../images/mendeodrant.jfif";

import Navbar from "./Navbar";
import Footer from "./Footer";

import { Link } from "react-router-dom";
import Modal from "react-modal/lib/components/Modal";
import { ThreeDots } from "react-loader-spinner";
import { toast } from "react-toastify";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { introQueryApi, textqueryApi } from "../Data/Services/Oneforall";
import { useDispatch, useSelector } from "react-redux";
import { chatBotData } from "../Data/Reducers/chatBot.reducer";

const Home = () => {
  const conversation = useSelector(
    (state) => state.chatBotReducer.conversation
  );

  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView();
  }, [conversation]);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [userMessage, setuserMessage] = useState("");
  const [loader, setLoader] = useState(false);

  const dispatch = useDispatch();

  Modal.setAppElement("#root");

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      border: "1px solid black",
      backgroundColor: "black",
    },
  };

  const takeInput = (e) => setuserMessage(e.target.value);

  const textQuery = async () => {
    if (userMessage.trim() === "") {
      return toast.info("no input found!", {
        position: "bottom-right",
        theme: "dark",
      });
    }

    setLoader(true);

    const response = await textqueryApi(userMessage);
    const user = response.result?.data?.query;
    const bot = response.result?.data?.reply;

    if (user) dispatch(chatBotData({ user }));
    if (bot) dispatch(chatBotData({ bot }));

    setuserMessage("");
    setLoader(false);
  };

  const intro = async () => {
    setLoader(true);

    const response = await introQueryApi();
    const bot = response.result?.data?.reply;

    if (conversation.length === 0 && bot) {
      dispatch(chatBotData({ bot }));
    }

    setLoader(false);
  };

  // SAFE SLIDER SETTINGS
  const brandSliderSettings = {
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: true,
    speed: 800,
    centerMode: true,
    centerPadding: "10px",
  };

  const topBrands = [
    dabur,
    dettol,
    garnier,
    himalya,
    mamaearth,
    muscleblaze,
    zandu,
  ];

  return (
    <>
      <Navbar />

      <button
        className="nurse"
        onClick={() => {
          setModalIsOpen(true);
          intro();
        }}
      >
        <i className="fas fa-user-nurse"></i>
      </button>

      {/* MAIN HERO */}
      <div className="aboutus-part">
        <div className="about-container">
          <div className="logo"></div>
          <div className="home-bg"></div>

          <div className="about">
            <label>
              Medshub 24/7 <br />
              delivers your health products, <br />
              prescribed medicines and more.
            </label>

            <div className="home-card">
              <Link to="/searchproducts">
                <div className="search-product">
                  <i className="fas fa-search"></i>
                  <p>search product</p>
                </div>
              </Link>

              <Link to="/productCategories/ourBrands">
                <div className="card-prod">
                  <i className="fas fa-truck-loading"></i>
                  <p>health product</p>
                </div>
              </Link>

              <Link to="/medicines">
                <div className="card-med">
                  <i className="fas fa-prescription-bottle-alt"></i>
                  <p>medicines</p>
                </div>
              </Link>

              <Link to="/searchmedicines">
                <div className="search-medicine">
                  <i className="fas fa-search-plus"></i>
                  <p>search medicine</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* TOP BRANDS */}
      <div className="home-parent">
        <div className="home">
          <div className="home-top-brands">
            <label>
              <Link to="/productCategories/ourBrands">
                <span className="font3">Top</span>
                <span className="font4">Brands</span>
              </Link>
            </label>

            <Slider {...brandSliderSettings}>
              {topBrands.map((img, idx) => (
                <div key={idx}>
                  <Link to="/productCategories/ourBrands">
                    <div className="brand">
                      <img src={img} alt={`brand-${idx}`} />
                    </div>
                  </Link>
                </div>
              ))}
            </Slider>
          </div>

          {/* SHOP BY CATEGORY */}
          <div className="home-categories">
            <div className="categories1">
              <div className="category big-img">
                <img src={sanitizer} alt="covid" />
                <Link to="/productCategories/covid-essentials">
                  <p>Safety from Covid</p>
                </Link>
              </div>
            </div>

            <div className="categories2">
              <label>
                <span className="font3">Shop By</span>
                <span className="font4">Category</span>
              </label>

              <div className="categories">
                <Link to="/productCategories/momandbabies">
                  <div className="category">
                    <img src={babies} alt="babies" />
                    <p>Mom and Babies</p>
                  </div>
                </Link>

                <Link to="/productCategories/Brandproducts/fitness">
                  <div className="category">
                    <img src={fitness} alt="fitness" />
                    <p>Fitness</p>
                  </div>
                </Link>

                <Link to="/productCategories/devices">
                  <div className="category">
                    <img src={devices} alt="devices" />
                    <p>Devices</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* BEAUTY */}
          <div className="home-beauty">
            <div className="home-beauty-container">
              <div className="beauty-bg">
                <div className="beauty-prod">
                  <div className="home-beauty-title">
                    <p>
                      <Link to="/productCategories/Beautyproducts">
                        <span className="font1">Beauty</span>
                        <span className="font2">Products</span>
                      </Link>
                    </p>
                  </div>

                  <div className="home-beauty-body">
                    {[haircare, facialkit, lipcare, bodycare].map(
                      (img, idx) => (
                        <Link
                          key={idx}
                          to="/productCategories/Beautyproducts"
                        >
                          <div className="beauty-product">
                            <img src={img} alt="beauty" />
                            <p>Beauty</p>
                          </div>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MEN'S GROOMING */}
          <div className="home-men">
            <div className="slider">
              {[beardoil, beardwash, hairgel, mendeo].map((img, idx) => (
                <Link key={idx} to="/productCategories/Men'sgrooming">
                  <div className="men-card">
                    <img src={img} alt="men" />
                    <p>Grooming</p>
                  </div>
                </Link>
              ))}
            </div>

            <label>
              <Link to="/productCategories/Men'sgrooming">
                <span className="font3">Men's </span>
                <span className="font4">Grooming</span>
              </Link>
            </label>
          </div>
        </div>
      </div>

      <Footer />

      {/* CHATBOT MODAL */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={customStyles}
        shouldCloseOnOverlayClick={false}
      >
        <div className="bot-body">
          <div className="bot-container">
            <div className="bot-close">
              <button
                className="cancel"
                onClick={() => setModalIsOpen(false)}
              >
                x
              </button>
            </div>

            <div className="chat">
              <div className="chat-bot">
                {Array.isArray(conversation) &&
                  conversation.map((msg, idx) => {
                    if (msg.bot)
                      return (
                        <div key={idx} className="sender">
                          <p>{String(msg.bot)}</p>
                        </div>
                      );

                    if (msg.user)
                      return (
                        <div key={idx} className="receiver">
                          <p>{String(msg.user)}</p>
                        </div>
                      );

                    return null;
                  })}

                <div ref={messageEndRef} />
              </div>
            </div>

            <div className="bot-button">
              <form onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  className="textbox"
                  value={userMessage}
                  onChange={takeInput}
                />

                <button className="send" onClick={textQuery}>
                  {loader ? (
                    <ThreeDots color="white" height={30} width={30} />
                  ) : (
                    <i className="far fa-paper-plane"></i>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Home;
