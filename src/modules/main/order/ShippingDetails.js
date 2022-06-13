import React, {useContext, useState} from 'react';
import {
  FlatList,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Divider, Text, withTheme} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Context as AuthContext} from '../../../context/Auth';
import useNetworkErrorHandling from '../../../hooks/useNetworkErrorHandling';
import {strings} from '../../../locales/i18n';
import {appStyles} from '../../../styles/styles';
import {getData, postData} from '../../../utils/api';
import {
  BASE_URL,
  CANCEL_ORDER,
  ON_CANCEL_ORDER,
  ON_TRACK_ORDER,
  TRACK_ORDER,
} from '../../../utils/apiUtilities';
import {FAQS, ORDER_STATUS} from '../../../utils/Constants';
import {showToastWithGravity} from '../../../utils/utils';
import Button from './Button';
import Support from './Support';

const returnLabel = strings('main.order.return');
const cancel = strings('main.order.cancel');

/**
 * Component is used to display shipping details to the user when card is expanded
 * @param order:single order object
 * @param getOrderList:function to request order list
 * @param theme:application theme
 * @returns {JSX.Element}
 * @constructor
 */
const ShippingDetails = ({order, getOrderList, theme}) => {
  const {colors} = theme;
  const {
    state: {token},
  } = useContext(AuthContext);
  const {handleApiError} = useNetworkErrorHandling();
  const [cancelInProgress, setCancelInProgress] = useState(false);
  const [trackInProgress, setTrackInProgress] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const shippingAddress = order.fulfillment.end.location.address;

  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const getSupportObj = {
    bpp_id: order.bppId,
    transaction_id: order.transactionId,
    ref_id: order.id,
  };

  /**
   * function used to request tracking details of order
   * @returns {Promise<void>}
   */
  const trackOrder = async () => {
    try {
      setTrackInProgress(true);
      const payload = [
        {
          context: {
            transaction_id: order.transactionId,
            bpp_id: order.bppId,
          },
          message: {order_id: order.id},
        },
      ];
      const {data} = await postData(
        `${BASE_URL}${TRACK_ORDER}`,
        payload,
        options,
      );
      if (data[0].message.ack.status === 'ACK') {
        const response = await getData(
          `${BASE_URL}${ON_TRACK_ORDER}messageIds=${data[0].context.message_id}`,
          options,
        );
        if (response.data[0].message.tracking.status === 'active') {
          const supported = await Linking.canOpenURL(FAQS);
          if (supported) {
            await Linking.openURL(FAQS);
          }
        }
      }
      setTrackInProgress(false);
    } catch (e) {
      handleApiError(e);
      setTrackInProgress(false);
    }
  };

  /**
   * function used to request cancel order
   * @returns {Promise<void>}
   */
  const cancelOrder = async () => {
    try {
      setCancelInProgress(true);
      const payload = {
        context: {
          bpp_id: order.bppId,
          transaction_id: order.transactionId,
        },
        message: {order_id: order.id, cancellation_reason_id: 'item'},
      };
      const {data} = await postData(
        `${BASE_URL}${CANCEL_ORDER}`,
        payload,
        options,
      );

      const response = await getData(
        `${BASE_URL}${ON_CANCEL_ORDER}messageId=${data.context.message_id}`,
        options,
      );
      if (response.data.message) {
        getOrderList(1)
          .then(() => {})
          .catch(() => {});
      } else {
        showToastWithGravity('Something went wrong!');
      }
      setCancelInProgress(false);
    } catch (e) {
      handleApiError(e);
      setCancelInProgress(false);
    }
  };

  /**
   * Component is used to display single item with title and cost
   * @param item:single ordered item
   * @returns {JSX.Element}
   * @constructor
   */
  const renderItem = ({item}) => {
    return (
      <View style={styles.priceContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.space} />
        <Text style={styles.price}>₹{item.price.value}</Text>
      </View>
    );
  };

  return (
    <View style={[appStyles.container, styles.container]}>
      <Divider />
      <FlatList data={order.quote.breakup} renderItem={renderItem} />
      <View>
        <View style={styles.addressContainer}>
          <Text style={{color: colors.grey}}>Billed To:</Text>
          <Text style={styles.name}>{order.billing.name}</Text>
          <Text style={styles.address}>{order.billing.email}</Text>
          <Text style={styles.address}>{order.billing.phone}</Text>

          <Text style={styles.address}>
            {order.billing.address.street} {order.billing.address.city}{' '}
            {order.billing.address.state}
          </Text>
          <Text>
            {order.billing.address.areaCode
              ? order.billing.address.areaCode
              : null}
          </Text>
        </View>
        {/* {order.fulfillment && (
          <View style={styles.addressContainer}>
            <Text style={{color: colors.grey}}>Shipped To:</Text>
            <Text style={styles.name}>{shippingAddress.name}</Text>
            <Text style={styles.address}>
              {order.fulfillment.end.contact.email}
            </Text>
            <Text style={styles.address}>
              {order.fulfillment.end.contact.phone}
            </Text>
            <Text style={styles.address}>
              {shippingAddress.street} {shippingAddress.city}{' '}
              {shippingAddress.state}
            </Text>
            <Text>
              {shippingAddress.areaCode ? shippingAddress.areaCode : null}
            </Text>
          </View>
        )} */}
      </View>
      <Divider style={styles.divider} />

      <View style={[styles.priceContainer, styles.container]}>
        <TouchableOpacity
          onPress={() => {
            setModalVisible(true);
          }}
          style={[styles.icon, {backgroundColor: colors.accentColor}]}>
          <Icon name="phone" color={colors.white} size={20} />
        </TouchableOpacity>
        <Support
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          item={getSupportObj}
        />
        {order.state !== ORDER_STATUS.CANCELLED ? (
          <>
            <View>
              <View style={styles.subContainer}>
                {order.state === ORDER_STATUS.DELIVERED ? (
                  <Button
                    backgroundColor={colors.greyOutline}
                    borderColor={colors.greyOutline}
                    title={returnLabel}
                  />
                ) : (
                  <Button
                    backgroundColor={colors.greyOutline}
                    borderColor={colors.greyOutline}
                    title={'Track'}
                    onPress={() => {
                      trackOrder()
                        .then(() => {})
                        .catch(() => {});
                    }}
                    loader={trackInProgress}
                    color={colors.black}
                  />
                )}
                <View style={styles.space} />
                <Button
                  backgroundColor={colors.accentColor}
                  borderColor={colors.accentColor}
                  title={cancel}
                  onPress={() => {
                    cancelOrder()
                      .then(() => {})
                      .catch(() => {});
                  }}
                  loader={cancelInProgress}
                  color={colors.white}
                />
              </View>
            </View>
          </>
        ) : (
          <Button
            backgroundColor={colors.cancelledBackground}
            borderColor={colors.error}
            color={colors.error}
            title={'Cancelled'}
            loader={cancelInProgress}
          />
        )}
      </View>
    </View>
  );
};

export default withTheme(ShippingDetails);

const styles = StyleSheet.create({
  addressContainer: {marginTop: 20, flexShrink: 1},
  text: {fontSize: 16, marginRight: 5},
  subContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  space: {margin: 5},
  container: {paddingVertical: 10},
  priceContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  name: {fontSize: 18, fontWeight: '700', marginVertical: 4, flexShrink: 1},
  title: {fontSize: 16, fontWeight: '700', marginRight: 10, flexShrink: 1},
  price: {fontSize: 16, fontWeight: '700'},
  address: {marginBottom: 4},
  icon: {paddingVertical: 8, paddingHorizontal: 10, borderRadius: 50},
  divider: {marginTop: 10},
});
