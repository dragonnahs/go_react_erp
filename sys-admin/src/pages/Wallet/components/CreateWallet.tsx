import React, { useState } from 'react';
import { Modal, Button, Typography, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';

interface CreateWalletProps {
  onSuccess: (publicKey: string) => void;
}

const CreateWallet: React.FC<CreateWalletProps> = ({ onSuccess }) => {
  const [visible, setVisible] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const generateWallet = () => {
    const mnemonic = bip39.generateMnemonic();
    setMnemonic(mnemonic);
    setVisible(true);
  };

  const handleConfirm = () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    try {
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const keypair = Keypair.fromSeed(seed.slice(0, 32));
      
      // 保存到本地存储
      localStorage.setItem('wallet', JSON.stringify({
        publicKey: keypair.publicKey.toString(),
        mnemonic,
      }));

      onSuccess(keypair.publicKey.toString());
      setVisible(false);
      setConfirmed(false);
      message.success('钱包创建成功');
    } catch (error) {
      message.error('创建钱包失败');
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={generateWallet}
      >
        创建钱包
      </Button>

      <Modal
        title={confirmed ? "确认助记词" : "备份助记词"}
        open={visible}
        onCancel={() => {
          setVisible(false);
          setConfirmed(false);
        }}
        onOk={handleConfirm}
        okText={confirmed ? "完成" : "我已备份"}
      >
        {!confirmed ? (
          <Space direction="vertical">
            <Typography.Paragraph>
              请妥善保管以下助记词，它是恢复钱包的唯一凭证：
            </Typography.Paragraph>
            <Typography.Text copyable strong>
              {mnemonic}
            </Typography.Text>
            <Typography.Paragraph type="warning">
              警告：请勿将助记词分享给任何人！
            </Typography.Paragraph>
          </Space>
        ) : (
          <Typography.Paragraph>
            请确认您已经安全备份了助记词，一旦丢失将无法找回。
          </Typography.Paragraph>
        )}
      </Modal>
    </>
  );
};

export default CreateWallet; 