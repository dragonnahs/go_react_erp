package model

type MemeToken struct {
    Symbol        string  `json:"symbol"`
    Name          string  `json:"name"`
    Price         float64 `json:"price"`
    PriceChange1h float64 `json:"price_change_1h"`
    Volume24h     float64 `json:"volume_24h"`
    MarketCap     float64 `json:"market_cap"`
    Holders       int     `json:"holders"`
    CreatedAt     string  `json:"created_at"`
    Rank          int     `json:"rank"`
} 