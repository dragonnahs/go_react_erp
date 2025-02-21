package service

import (
	"bytes"
	"encoding/json"
	"erp-sys/internal/model"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"time"
)

type MemeTokenService struct{}

func NewMemeTokenService() *MemeTokenService {
	return &MemeTokenService{}
}

// GraphQL 查询结构
type GraphQLQuery struct {
	Query     string                 `json:"query"`
	Variables map[string]interface{} `json:"variables,omitempty"`
}

// Uniswap V3 响应结构
type UniswapResponse struct {
	Data struct {
		Tokens []struct {
			ID            string `json:"id"`
			Symbol        string `json:"symbol"`
			Name          string `json:"name"`
			TotalValueLockedUSD string `json:"totalValueLockedUSD"`
			VolumeUSD     string `json:"volumeUSD"`
			TokenDayData  []struct {
				PriceUSD      string `json:"priceUSD"`
				VolumeUSD     string `json:"volumeUSD"`
				TotalValueLockedUSD string `json:"totalValueLockedUSD"`
			} `json:"tokenDayData"`
		} `json:"tokens"`
	} `json:"data"`
}

func (s *MemeTokenService) GetHotMemeTokens() ([]model.MemeToken, error) {
	// 构建 GraphQL 查询
	oneHourAgo := time.Now().Add(-1 * time.Hour).Unix()
	query := fmt.Sprintf(`{
		tokens(
			first: 100,
			orderBy: volumeUSD,
			orderDirection: desc,
			where: {
				totalValueLockedUSD_gt: "10000"
			}
		) {
			id
			symbol
			name
			totalValueLockedUSD
			volumeUSD
			tokenDayData(
				first: 2,
				orderBy: date,
				orderDirection: desc,
				where: {
					date_gt: %d
				}
			) {
				priceUSD
				volumeUSD
				totalValueLockedUSD
			}
		}
	}`, oneHourAgo)

	// 准备请求
	graphqlQuery := GraphQLQuery{
		Query: query,
	}
	jsonData, err := json.Marshal(graphqlQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal query: %v", err)
	}

	// 发送请求到 Uniswap V3 Subgraph
	req, err := http.NewRequest("POST", "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch data: %v", err)
	}
	defer resp.Body.Close()

	// 解析响应
	var uniswapResp UniswapResponse
	if err := json.NewDecoder(resp.Body).Decode(&uniswapResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	// 转换为我们的数据结构
	var tokens []model.MemeToken
	for i, token := range uniswapResp.Data.Tokens {
		// 计算价格变化
		var priceChange float64
		if len(token.TokenDayData) >= 2 {
			currentPrice, _ := strconv.ParseFloat(token.TokenDayData[0].PriceUSD, 64)
			previousPrice, _ := strconv.ParseFloat(token.TokenDayData[1].PriceUSD, 64)
			if previousPrice > 0 {
				priceChange = ((currentPrice - previousPrice) / previousPrice) * 100
			}
		}

		volume24h, _ := strconv.ParseFloat(token.VolumeUSD, 64)
		marketCap, _ := strconv.ParseFloat(token.TotalValueLockedUSD, 64)
		currentPrice, _ := strconv.ParseFloat(token.TokenDayData[0].PriceUSD, 64)

		tokens = append(tokens, model.MemeToken{
			Rank:          i + 1,
			Symbol:        token.Symbol,
			Name:          token.Name,
			Price:         currentPrice,
			PriceChange1h: priceChange,
			Volume24h:     volume24h,
			MarketCap:     marketCap,
			CreatedAt:     time.Now().Format(time.RFC3339),
		})
	}

	// 按交易量排序
	sort.Slice(tokens, func(i, j int) bool {
		return tokens[i].Volume24h > tokens[j].Volume24h
	})

	return tokens, nil
} 