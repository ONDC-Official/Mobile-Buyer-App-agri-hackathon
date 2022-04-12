import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {SearchBar, Text, withTheme} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import {strings} from '../../../locales/i18n';
import FilterButton from './FilterButton';

const product = strings('main.product.product_label');
const provider = strings('main.product.provider_label');
const category = strings('main.product.category_label');
const search = strings('main.product.search_label');

const Header = ({theme, openSheet, onSearch, location}) => {
  const {colors} = theme;
  const [selectedCard, setSelectedCard] = useState(product);
  const [item, setItem] = useState(null);

  const onCardSelect = card => setSelectedCard(card);

  return (
    <View style={[styles.container, {backgroundColor: colors.white}]}>
      <View style={styles.locationContainer}>
        <TouchableOpacity style={styles.subContainer} onPress={openSheet}>
          <Icon name="map-marker" size={20} color={colors.primary} />
          <View style={styles.textContainer}>
            <Text style={{color: colors.primary}}>
              {location} <Icon name="angle-down" size={14} />
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.cardContainer}>
        <FilterButton
          name={product}
          onPress={() => {
            onCardSelect(product);
          }}
          selectedCard={selectedCard}
        />
        <View style={styles.space} />
        <FilterButton
          name={provider}
          onPress={() => {
            onCardSelect(provider);
          }}
          selectedCard={selectedCard}
        />
        <View style={styles.space} />

        <FilterButton
          name={category}
          onPress={() => {
            onCardSelect(category);
          }}
          selectedCard={selectedCard}
        />
      </View>
      <SearchBar
        round={true}
        lightTheme={true}
        placeholder={`${search} ${selectedCard}`}
        containerStyle={[
          styles.containerStyle,
          {backgroundColor: colors.white},
        ]}
        inputContainerStyle={[
          styles.inputContainerStyle,
          {backgroundColor: colors.white},
        ]}
        onSubmitEditing={() => {
          onSearch(item, selectedCard);
        }}
        onChangeText={setItem}
        value={item}
      />
    </View>
  );
};

export default withTheme(Header);

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.18,
    shadowRadius: 1,
  },
  subContainer: {flexDirection: 'row', alignItems: 'center'},
  locationContainer: {marginBottom: 10},
  textContainer: {marginLeft: 8, flexShrink: 1},
  containerStyle: {padding: 0, borderRadius: 15},
  cardContainer: {flexDirection: 'row', marginBottom: 10},
  space: {marginHorizontal: 5},
  inputContainerStyle: {elevation: 10, borderRadius: 15},
});