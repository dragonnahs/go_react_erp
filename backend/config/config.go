package config

import (
	"log"

	"github.com/spf13/viper"
)

var Config *viper.Viper

func Init() {
	Config = viper.New()
	Config.SetConfigName("config")
	Config.SetConfigType("yaml")
	Config.AddConfigPath("./config")
	
	if err := Config.ReadInConfig(); err != nil {
		log.Fatalf("Error reading config file: %s", err)
	}
} 