import React from "react";
import "./Card.css";

function Card({ title, value, change, positive }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p className="value">{value}</p>
      <span className={positive ? "positive" : "negative"}>{change} from last month</span>
    </div>
  );
}

export default Card;
