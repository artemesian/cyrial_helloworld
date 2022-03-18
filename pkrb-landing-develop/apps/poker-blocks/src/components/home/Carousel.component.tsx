import { styled } from "@mui/material/styles";
import { Theme, useTheme } from "@mui/material";
import { useState } from "react";
import AOS from "aos";
import texasHoldemOnlinePokerImage1 from "../../assets/images/texasHoldemOnlinePokerImage1.png";
import texasHoldemOnlinePokerImage2 from "../../assets/images/texasHoldemOnlinePokerImage2.png";
import texasHoldemOnlinePokerImage3 from "../../assets/images/texasHoldemOnlinePokerImage3.png";
import texasHoldemOnlinePokerImage4 from "../../assets/images/texasHoldemOnlinePokerImage4.png";
import texasHoldemOnlinePokerImage5 from "../../assets/images/texasHoldemOnlinePokerImage5.png";
AOS.init();
export default function Carousel(): JSX.Element {
  const theme = useTheme();
  const [activeImage, setActiveImage] = useState<number>(3);

  const handleClickActivateImage = (id: number) => {
    setActiveImage(id);
  };

  const carouselImage = [
    texasHoldemOnlinePokerImage5,
    texasHoldemOnlinePokerImage3,
    texasHoldemOnlinePokerImage1,
    texasHoldemOnlinePokerImage2,
    texasHoldemOnlinePokerImage4,
  ];

  const CustomizedCarousel = styled("section")(
    ({ theme }: { theme: Theme }) => `
    main#carousel {
    grid-row: 1 / 2;
    grid-column: 1 / 8;
    width: 900px;
    max-width: 100vw;
    height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transform-style: preserve-3d;
    perspective: 600px;
    --items: ${carouselImage.length};
    --middle: ${Math.round(carouselImage.length / 2)};
    --position: 1;
    }

    
    div.item {
        position: absolute;
        box-sizing: border-box;
        --r: calc(var(--position) - var(--offset));
        --abs: max(calc(var(--r) * -1), var(--r));
        --opacity-value: calc(1 - calc(var(--abs) / 10));
        transition: all 0.25s linear;
        transform: rotateY(calc(-3deg * var(--r)))
            translateX(calc(-200px * var(--r)))
            scale(calc(1 - var(--abs) / 10));
        opacity: var(--opacity-value);
        z-index: calc((var(--position) - var(--abs)));
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden
    }
    div.item>img {
        width: 245px;
        max-width: calc(100vw - 24px);
        height: 370px;
        flex-shring: 0;
        min-width: 100%;
        min-height: 100%;
        object-fit: cover;
        filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
        cursor: pointer;
    }
    ${carouselImage.map(
      (_, index) => `
        div.item:nth-of-type(${index + 1}) {
        --offset: ${index + 1};
    }
    `
    ).join(`
    `)}
    ${carouselImage.map(
      (_, index) => `/*
        input:nth-of-type(${index + 1}) {
        grid-column: ${index + 2} / ${index + 3};
        grid-row: 2 / 3;
        }*/
        input:nth-of-type(${index + 1}):checked ~ main#carousel {
        --position: ${index + 1};
    }
    `
    ).join(`
    `)}
`
  );
  return (
    <CustomizedCarousel>
      {carouselImage.map((_, index) => (
        <input
          key={index}
          type="radio"
          name="position"
          checked={activeImage === index + 1}
          style={{
            visibility: "hidden",
          }}
        />
      ))}
      <main id="carousel">
        {carouselImage.map((src, index) => (
          <div
            key={index}
            className="item"
            onClick={() => handleClickActivateImage(index + 1)}
          >
            <img
              data-aos="fade-up"
              src={src}
              alt="pokerblocks card"
              style={{
                filter:
                  activeImage === index + 1
                    ? `drop-shadow(0px 0px 16px ${theme.common.yellow})`
                    : "none",
                border:
                  activeImage === index + 1
                    ? `3px solid ${theme.common.yellow}`
                    : "none",
              }}
            />
          </div>
        ))}
      </main>
    </CustomizedCarousel>
  );
}
