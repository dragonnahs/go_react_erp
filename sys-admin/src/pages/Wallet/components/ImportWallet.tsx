/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-28 18:03:35
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-03-04 18:45:12
 * @FilePath: \go_react_erp\sys-admin\src\pages\Wallet\components\ImportWallet.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from 'react';
import { Modal, Input, Form, Button, message, Radio } from 'antd';
import { ImportOutlined } from '@ant-design/icons';
import { ethers } from 'ethers';

interface ImportWalletProps {
  onSuccess: (publicKey: string) => void;
}

type ImportType = 'mnemonic' | 'privateKey';

const ImportWallet: React.FC<ImportWalletProps> = ({ onSuccess }) => {
  const [visible, setVisible] = useState(false);
  const [importType, setImportType] = useState<ImportType>('mnemonic');
  const [form] = Form.useForm();

  const handleImport = async (values: { mnemonic?: string; privateKey?: string }) => {
    try {
      let wallet: ethers.Wallet;

      if (importType === 'mnemonic') {
        // 使用助记词导入
        const mnemonic = values.mnemonic?.trim();
        if (!ethers.Mnemonic.isValidMnemonic(mnemonic || '')) {
          throw new Error('Invalid mnemonic');
        }
        // 使用默认路径 "m/44'/60'/0'/0/0" 导入以太坊钱包
        wallet = ethers.Wallet.fromPhrase(mnemonic || '');
      } else {
        // 使用私钥导入
        const privateKey = values.privateKey?.startsWith('0x')
          ? values.privateKey
          : `0x${values.privateKey}`;
        wallet = new ethers.Wallet(privateKey);
      }

      const address = await wallet.getAddress();

      // 保存到本地存储
      localStorage.setItem('wallet', JSON.stringify({
        publicKey: address,
        mnemonic: importType === 'mnemonic' ? values.mnemonic : undefined,
        privateKey: importType === 'privateKey' ? wallet.privateKey : undefined,
        network: 'sepolia'
      }));

      message.success('钱包导入成功');
      onSuccess(address);
      setVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Import wallet error:', error);
      message.error(importType === 'mnemonic' 
        ? '导入失败，请检查助记词是否正确' 
        : '导入失败，请检查私钥格式是否正确'
      );
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<ImportOutlined />}
        onClick={() => setVisible(true)}
      >
        导入钱包
      </Button>

      <Modal
        title="导入 Sepolia 钱包"
        open={visible}
        onCancel={() => {
          setVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleImport}
          layout="vertical"
        >
          <Form.Item>
            <Radio.Group
              value={importType}
              onChange={(e) => {
                setImportType(e.target.value);
                form.resetFields();
              }}
            >
              <Radio.Button value="mnemonic">助记词</Radio.Button>
              <Radio.Button value="privateKey">私钥</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {importType === 'mnemonic' ? (
            <Form.Item
              name="mnemonic"
              label="助记词"
              rules={[
                { required: true, message: '请输入助记词' },
                {
                  validator: (_, value) =>
                    ethers.Mnemonic.isValidMnemonic(value?.trim() || '')
                      ? Promise.resolve()
                      : Promise.reject('助记词格式不正确')
                }
              ]}
              extra="请输入12个或24个助记词，用空格分隔"
            >
              <Input.TextArea
                rows={4}
                placeholder="请输入助记词，单词之间用空格分隔"
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="privateKey"
              label="私钥"
              rules={[
                { required: true, message: '请输入私钥' },
                {
                  pattern: /^(0x)?[0-9a-fA-F]{64}$/,
                  message: '请输入有效的以太坊私钥'
                }
              ]}
              extra="请输入你的 Sepolia 测试网私钥（64位十六进制字符）"
            >
              <Input.Password
                placeholder="输入私钥（以0x开头或不带0x）"
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              导入
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ImportWallet; 