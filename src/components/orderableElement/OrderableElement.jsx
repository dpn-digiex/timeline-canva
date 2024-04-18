import React, { useCallback, useEffect, useRef, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { DeleteIcon, PlusIcon } from "../../icons";
import classNames from "classnames";
import styles from "./element.module.scss";

const getStylesElement = (width, isSelected, draggableStyle) => ({
  minWidth: !isSelected ? width : "100px",
  // maxWidth: !isSelected ? width : "100px",
  ...draggableStyle
});

const OrderableElement = ({
  item,
  isSelected,
  isDragOnlist,
  index,
  handleAddElement = () => {},
  handleRemoveElement = () => {}
}) => {
  const EDGE_WIDTH = 8;
  const INITIAL_WIDTH = 100;
  const INITIAL_DURATION_FRAME = 3;
  const INITIAL_FRAME = 1;
  const MIN_RESIZEABLE = 36;
  const MAX_RESIZEABLE = 1000;

  const [disableDrag, setDisableDrag] = useState(false);
  const [hoverEdge, setHoverEdge] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [typeResize, setTypeResize] = useState("");
  const [widthElement, setWidthElement] = useState(INITIAL_WIDTH);
  const [durationFrame, setDurationFrame] = useState(item.duration);
  const [listFrame, setListFrame] = useState(INITIAL_FRAME);

  let elementRef = useRef(null);

  const handleMouseMove = (e) => {
    const element = e.target;
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeft = x <= EDGE_WIDTH;
    const isRight = x >= rect.width - EDGE_WIDTH;
    setHoverEdge(isLeft || isRight);
    setDisableDrag(isLeft || isRight);
  };

  const handleMouseLeave = (e) => {
    setHoverEdge(false);
  };

  const startResizing = useCallback((type) => {
    setIsResizing(true);
    setTypeResize(type);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    if (widthElement < MIN_RESIZEABLE || widthElement === MIN_RESIZEABLE) {
      setWidthElement(INITIAL_WIDTH);
    }
  }, [widthElement]);

  const resize = useCallback(
    (e) => {
      if (isResizing) {
        if (typeResize === "RIGHT") {
          const newWidth =
            e.clientX - elementRef.current.getBoundingClientRect().left;
          calculateIndicators(newWidth);
        } else if (typeResize === "LEFT") {
          const newWidth =
            elementRef.current.getBoundingClientRect().right - e.clientX;
          calculateIndicators(newWidth);
        }
      }
    },
    [isResizing]
  );

  const calculateIndicators = (width) => {
    if (width > MAX_RESIZEABLE || width < MIN_RESIZEABLE - 2) return;
    else {
      setWidthElement(width);
      const newFrames = Math.round(width / INITIAL_WIDTH);
      setListFrame(newFrames < INITIAL_FRAME ? INITIAL_FRAME : newFrames);
      // rule 100px ~ 3s ~ 1frame
      const newDuration = (width / INITIAL_WIDTH) * INITIAL_DURATION_FRAME;
      setDurationFrame(newDuration.toFixed(1));
    }
  };

  const setElementRef = useCallback((el) => {
    elementRef.current = el;
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing, isResizing]);

  return (
    <Draggable
      index={index}
      key={item.id}
      draggableId={item.id}
      isDragDisabled={disableDrag}
    >
      {(provided, snapshot, draggableProps) => {
        return (
          <div
            ref={(ref) => {
              provided.innerRef(ref);
              setElementRef(ref);
            }}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={classNames(
              styles.orderableElement,
              isSelected && styles.selected
            )}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={getStylesElement(
              widthElement,
              isSelected,
              provided.draggableProps.style
            )}
          >
            <div
              className={classNames(
                styles.thumbnail,
                widthElement > 150 && styles.overflowContent
              )}
            >
              {((hoverEdge && !isDragOnlist) || isResizing) && (
                <div
                  onMouseDown={() => startResizing("LEFT")}
                  className={styles.resizeBarLeft}
                >
                  <div className={styles.verticalLine} />
                </div>
              )}
              {item?.thumbnail &&
                Array(listFrame)
                  .fill(0)
                  .map((_, index) => (
                    <img key={index} src={item.thumbnail} alt="img" />
                  ))}
              {((hoverEdge && !isDragOnlist) || isResizing) && (
                <div
                  onMouseDown={() => startResizing("RIGHT")}
                  className={styles.resizeBarRight}
                >
                  <div className={styles.verticalLine} />
                </div>
              )}
            </div>
            <div className={styles.footer}>
              <p className={styles.timeDuration}>{durationFrame}s</p>
              <div
                className={styles.iconDelete}
                onClick={() => handleRemoveElement(index)}
              >
                <DeleteIcon />
              </div>
            </div>
            {!isSelected && (
              <div
                className={styles.addWrapper}
                onClick={() =>
                  handleAddElement({ id: uuidv4(), duration: 3 }, index)
                }
              >
                <PlusIcon />
              </div>
            )}
          </div>
        );
      }}
    </Draggable>
  );
};

export default OrderableElement;
