import React, { useState } from "react";
import OrderableList from "../orderableList/OrderableList";

import styles from "./timeline.module.scss";

const TemplateIndicator = ({ templates }) => {
  const [templatesList, setTemplatesList] = useState(templates);

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.header}></div>
      <div className={styles.body}>
        <div className={styles.playTimeline}></div>
        <div className={styles.templatesList}>
          <OrderableList listItems={templatesList} />
        </div>
      </div>
    </div>
  );
};

export default TemplateIndicator;
