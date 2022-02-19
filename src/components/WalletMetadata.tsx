import React, { useContext, useEffect, useState } from 'react';
import { WalletContext } from '../contexts';
import './WalletMetadata.scss'
import { Button, message } from 'antd';
import { InjectedMetadataKnown, MetadataDef } from '@polkadot/extension-inject/types';
import { PlusCircleOutlined } from '@ant-design/icons';

interface Props {
  className?: string;
}

function WalletMetadata ({}: Props): React.ReactElement<Props> {
  const walletContext = useContext(WalletContext)
  const [injectedMetas, setInjectedMetas] = useState<InjectedMetadataKnown[]>([]);

  const loadMetadata = () => {
    const metadata = walletContext.wallet?.metadata
    if (metadata) {
      metadata.get().then((rs) => {
        setInjectedMetas(rs);
      })
    }
  }

  useEffect(() => {
    setTimeout(() => {
      loadMetadata();
    }, 300)
  }, [walletContext.wallet])


  const addMetadata = () => {
    const metadata = walletContext.wallet?.metadata
    if (metadata) {
      const newMetaDef = {
        chain: 'SubWallet Connect Demo',
        genesisHash: '0x1bf2a278799868de66ea8610f2ce7c8c43706561b6476031315f6640fe38e888',
        icon: 'substrate',
        ss58Format: 0,
        chainType: 'substrate',
        color: '#F0F0F0',
        specVersion: Math.floor(Date.now() / 1000),
        tokenDecimals: 12,
        tokenSymbol: 'SWCC'
      } as MetadataDef
      const key = 'add-metadata'
      message.loading({content: 'Adding Metadata', key})
      metadata.provide(newMetaDef)
        .then((rs) => {
          message.success({content: 'Add Metadata Successfully!', key})
          loadMetadata();
        })
        .catch((error) => {
        message.warn({content: 'Add Metadata Failed or Cancelled!', key})
      })
    }
  }

  return (<div className={'wallet-metadata'}>
    <div className={'metadata-list'}>
      {injectedMetas.map(meta =>
        <div className="metadata-item">
          <div className='metadata-item-info'>
            <span className='metadata-item__title'>Genesis Hash:</span>
            <span className='metadata-item__content'>{meta.genesisHash}</span>
          </div>
          <div className='metadata-item-info'>
            <span className='metadata-item__title'>Spec Version:</span>
            <span className='metadata-item__content'>{meta.specVersion}</span>
          </div>
        </div>)}
    </div>
    <Button className='sub-wallet-btn sub-wallet-icon-btn' onClick={addMetadata} type={'primary'} icon={<PlusCircleOutlined />}>Add Example Metadata</Button>
  </div>);
}

export default WalletMetadata