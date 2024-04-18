import React, { useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { isEmpty } from "lodash";
import styles from "./list.module.scss";
import OrderableElement from "../orderableElement/OrderableElement";

const OrderableList = ({ listItems }) => {
  const [items, setItems] = useState(listItems);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [placeholderProps, setPlaceholderProps] = useState({});

  const GAP_LIST = 16;

  const getDraggedDom = (draggableId) => {
    const domQuery = `[${"data-rbd-drag-handle-draggable-id"}='${draggableId}']`;
    const draggedDOM = document.querySelector(domQuery);
    return draggedDOM;
  };

  const handleDragEnd = (event) => {
    if (!event.destination) {
      setItems(items);
    } else {
      const itemsCopy = [...items];
      const [reorderedItem] = itemsCopy.splice(event.source.index, 1);
      itemsCopy.splice(event.destination.index, 0, reorderedItem);
      setItems(itemsCopy);
    }
    setPlaceholderProps({});
    setSelectedIdx(null);
  };

  const handleDragStart = (event) => {
    if (!event.source) return;
    setSelectedIdx(event.source.index);

    const draggedDOM = getDraggedDom(event.draggableId);
    if (!draggedDOM) {
      return;
    }
    const { clientHeight, clientWidth } = draggedDOM;
    const sourceIndex = event.source.index;
    const clientX =
      parseFloat(window.getComputedStyle(draggedDOM.parentNode).paddingLeft) +
      [...draggedDOM.parentNode.children]
        .slice(0, sourceIndex)
        .reduce((total, curr) => {
          const style = curr.currentStyle || window.getComputedStyle(curr);
          const marginRight = parseFloat(style.marginRight);
          return total + curr.clientWidth + marginRight + GAP_LIST;
        }, 0);

    setPlaceholderProps({
      clientHeight,
      clientWidth,
      clientY: parseFloat(
        window.getComputedStyle(draggedDOM.parentNode).paddingTop
      ),
      clientX
    });
  };

  const handleDragUpdate = (event) => {
    if (!event.destination) {
      return;
    }
    const draggedDOM = getDraggedDom(event.draggableId);
    if (!draggedDOM) {
      return;
    }
    const { clientHeight, clientWidth } = draggedDOM;
    const destinationIndex = event.destination.index;
    const sourceIndex = event.source.index;

    const childrenArray = [...draggedDOM.parentNode.children];
    const movedItem = childrenArray[sourceIndex];
    childrenArray.splice(sourceIndex, 1);

    const updatedArray = [
      ...childrenArray.slice(0, destinationIndex),
      movedItem,
      ...childrenArray.slice(destinationIndex)
    ];

    const clientX =
      parseFloat(window.getComputedStyle(draggedDOM.parentNode).paddingLeft) +
      updatedArray.slice(0, destinationIndex).reduce((total, curr) => {
        const style = curr.currentStyle || window.getComputedStyle(curr);
        const marginRight = parseFloat(style.marginRight);
        return total + curr.clientWidth + marginRight + GAP_LIST;
      }, 0);

    setPlaceholderProps({
      clientHeight,
      clientWidth,
      clientY: parseFloat(
        window.getComputedStyle(draggedDOM.parentNode).paddingTop
      ),
      clientX
    });
  };

  const handleAddElement = (template, desIdx) => {
    const newList = [...items];
    newList.splice(desIdx + 1, 0, template);
    setItems(newList);
  };

  const handleRemoveElement = (desIdx) => {
    const newList = [...items];
    newList.splice(desIdx, 1);
    setItems(newList);
  };

  return (
    <DragDropContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragUpdate={handleDragUpdate}
    >
      <Droppable droppableId="horizontal-list" direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={styles.listContainer}
          >
            {items.map((item, index) => (
              <OrderableElement
                key={item.id}
                item={item}
                index={index}
                isSelected={selectedIdx === index}
                isDragOnlist={selectedIdx !== null}
                handleAddElement={handleAddElement}
                handleRemoveElement={handleRemoveElement}
              />
            ))}
            {provided.placeholder}
            {!isEmpty(placeholderProps) && snapshot.isDraggingOver && (
              <div
                className={styles.placeholder}
                style={{
                  top: placeholderProps.clientY,
                  left: placeholderProps.clientX,
                  height: placeholderProps.clientHeight,
                  width: placeholderProps.clientWidth
                }}
              />
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default OrderableList;
