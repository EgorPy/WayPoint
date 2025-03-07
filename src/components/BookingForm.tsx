import React, { useState } from "react";

const BookingForm: React.FC = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [transport, setTransport] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ from, to, date, transport });
  };

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <input type="text" placeholder="Откуда" value={from} onChange={(e) => setFrom(e.target.value)} required />
      <input type="text" placeholder="Куда" value={to} onChange={(e) => setTo(e.target.value)} required />
      <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
      <select value={transport} onChange={(e) => setTransport(e.target.value)} required>
        <option value="">Транспорт</option>
        <option value="bus">Автобус</option>
        <option value="train">Поезд</option>
        <option value="plane">Самолёт</option>
        <option value="mix">Микс</option>
      </select>
      <button type="submit">Найти</button>
    </form>
  );
};

export default BookingForm;
