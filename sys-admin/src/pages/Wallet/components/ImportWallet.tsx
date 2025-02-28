import React, { useState } from 'react';
import { Modal, Input, Form, Button, message } from 'antd';
import { ImportOutlined } from '@ant-design/icons';
import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';

interface ImportWalletProps {
  onSuccess: (publicKey: string) => void;
}

const ImportWallet: React.FC<ImportWalletProps> = ({ onSuccess }) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const handleImport = async (values: { mnemonic: string }) => {
    try {
      const seed = await bip39.mnemonicToSeed(values.mnemonic);
      const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
      const keypair = Keypair.fromSeed(derivedSeed);
      
      // 保存到本地存储
      localStorage.setItem('wallet', JSON.stringify({
        publicKey: keypair.publicKey.toString(),
        mnemonic: values.mnemonic,
      }));

      onSuccess(keypair.publicKey.toString());
      setVisible(false);
      message.success('钱包导入成功');
    } catch (error) {
      message.error('导入失败，请检查助记词是否正确');
    }
  };

  return (
    <>
      <Button 
        icon={<ImportOutlined />}
        onClick={() => setVisible(true)}
      >
        导入钱包
      </Button>

      <Modal
        title="导入钱包"
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          onFinish={handleImport}
          layout="vertical"
        >
          <Form.Item
            name="mnemonic"
            label="助记词"
            rules={[
              { required: true, message: '请输入助记词' },
              { 
                validator: (_, value) => 
                  bip39.validateMnemonic(value) 
                    ? Promise.resolve()
                    : Promise.reject('助记词格式不正确')
              }
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="请输入12个或24个助记词，用空格分隔"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ImportWallet; 