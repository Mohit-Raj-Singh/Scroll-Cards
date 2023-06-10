import React, { useState, useEffect } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import "./Page.css";

const Page = () => {
  const [cards, setCards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");

  useEffect(() => {
    fetchCards();
  }, [currentPage, selectedTab, selectedFilter]);

  const fetchCards = async () => {
    try {
      const response = await axios.get(
        `https://volopay-server.vercel.app/data?page=${currentPage}&per_page=10`
      );
      const data = response.data;
      setCards((prevCards) => [...prevCards, ...data]);
      setCurrentPage((prevPage) => prevPage + 1);
      setHasMore(data.length === 10);
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setCurrentPage(1);
    setCards([]);
    setHasMore(true);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
    setCards([]);
    setHasMore(true);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  const filteredCards = cards.filter((card) => {
    if (selectedTab === "all") {
      return true;
    } else if (selectedTab === "blocked") {
      return card.status === "in-active";
    } else if (selectedTab === "your") {
      return card.status === "active";
    }
  });

  const searchedCards = filteredCards.filter((card) =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderedCards = searchedCards.map((card, index) => (
    <div className="card" key={index}>
      <div className="card-body">
        <h3>{card.name}</h3>
        <div className="card-type">{card.card_type}</div>
        <p>Budget: {card.budget_name}</p>
        <p>
          Spent: {card.spent.value} {card.spent.currency}
        </p>
        <p>
          Available to spend: {card.available_to_spend.value}{" "}
          {card.available_to_spend.currency}
        </p>
        {card.card_type === "burner" && <p>Expiry: {card.expiry}</p>}
        {card.card_type === "subscription" && <p>Limit: {card.limit}</p>}
        <p>Status: {card.status}</p>
      </div>
    </div>
  ));

  return (
    <div>
      <div className="tabs">
        <button
          className={selectedTab === "your" ? "active" : ""}
          onClick={() => handleTabChange("your")}
        >
          Your Cards
        </button>
        <button
          className={selectedTab === "all" ? "active" : ""}
          onClick={() => handleTabChange("all")}
        >
          All Cards
        </button>
        <button
          className={selectedTab === "blocked" ? "active" : ""}
          onClick={() => handleTabChange("blocked")}
        >
          Blocked Cards
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by card name"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <div className="filter-dropdown">
        <select
          value={selectedFilter}
          onChange={(event) => handleFilterChange(event.target.value)}
        >
          <option value="">All</option>
          <option value="burner">Burner</option>
          <option value="subscription">Subscription</option>
        </select>
      </div>

      <InfiniteScroll
        dataLength={cards.length}
        next={fetchCards}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
      >
        {renderedCards}
      </InfiniteScroll>
    </div>
  );
};

export default Page;
