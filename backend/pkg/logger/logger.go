package logger

import (
	"erp-sys/config"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

var Log *zap.Logger

func Init() {
	// 日志文件配置
	hook := lumberjack.Logger{
		Filename:   config.Config.GetString("log.filename"),
		MaxSize:    config.Config.GetInt("log.max_size"),
		MaxBackups: config.Config.GetInt("log.max_backups"),
		MaxAge:     config.Config.GetInt("log.max_age"),
		Compress:   true,
	}
	
	encoderConfig := zapcore.EncoderConfig{
		TimeKey:        "time",
		LevelKey:       "level",
		NameKey:        "logger",
		CallerKey:      "caller",
		MessageKey:     "msg",
		StacktraceKey:  "stacktrace",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.LowercaseLevelEncoder,
		EncodeTime:     zapcore.ISO8601TimeEncoder,
		EncodeDuration: zapcore.SecondsDurationEncoder,
		EncodeCaller:   zapcore.ShortCallerEncoder,
	}
	
	core := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderConfig),
		zapcore.AddSync(&hook),
		zap.NewAtomicLevelAt(zapcore.DebugLevel),
	)
	
	Log = zap.New(core, zap.AddCaller())
} 