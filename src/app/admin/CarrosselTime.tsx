"use client";

import React from "react";
import styles from "./styles/CarrosselTime.module.css";

interface CarrosselTimeProps {
  selectedHour: number;
  selectedMinute: number;
  onChange: (hour: number, minute: number) => void;
}

function generateHours(): number[] {
  const hours = [];
  for (let h = 0; h < 24; h++) {
    hours.push(h);
  }
  return hours;
}

function generateMinutes(): number[] {
  const mins = [];
  for (let m = 0; m < 60; m++) {
    mins.push(m);
  }
  return mins;
}

const CarrosselTime: React.FC<CarrosselTimeProps> = ({
  selectedHour,
  selectedMinute,
  onChange,
}) => {
  const hours = generateHours();
  const minutes = generateMinutes();

  const formatTwoDigits = (value: number) => value.toString().padStart(2, "0");

  const handleHourClick = (h: number) => {
    onChange(h, selectedMinute);
  };

  const handleMinuteClick = (m: number) => {
    onChange(selectedHour, m);
  };

  return (
    <div className={styles.container}>
      {/* Carrossel de Horas */}
      <div className={styles.carouselRow}>
        {hours.map((h) => (
          <div
            key={`hour-${h}`}
            className={`${styles.card} ${
              h === selectedHour ? styles.selected : ""
            }`}
            onClick={() => handleHourClick(h)}
          >
            {formatTwoDigits(h)}
          </div>
        ))}
      </div>

      {/* Carrossel de Minutos */}
      <div className={styles.carouselRow}>
        {minutes.map((m) => (
          <div
            key={`min-${m}`}
            className={`${styles.card} ${
              m === selectedMinute ? styles.selected : ""
            }`}
            onClick={() => handleMinuteClick(m)}
          >
            {formatTwoDigits(m)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarrosselTime;
