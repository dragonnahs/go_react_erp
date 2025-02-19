package service

import (
	"encoding/json"
	"erp-sys/internal/model"
	"fmt"
	"net/http"
	"sort"
)

type MemeTokenService struct{}

func NewMemeTokenService() *MemeTokenService {
	return &MemeTokenService{}
}

func (s *MemeTokenService) GetHotMemeTokens() ([]model.MemeToken, error) {
	// 调用 DEX API 获取数据
	resp, err := http.Get("https://api.dextools.io/v1/token/trending")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch data: %v", err)
	}
	defer resp.Body.Close()

	var response struct {
		Data []model.MemeToken `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	// 按1小时涨幅排序
	sort.Slice(response.Data, func(i, j int) bool {
		return response.Data[i].PriceChange1h > response.Data[j].PriceChange1h
	})

	// 添加排名
	for i := range response.Data {
		response.Data[i].Rank = i + 1
	}

	return response.Data, nil
} 