import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  PermissionsAndroid,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isImageFocused, setIsImageFocused] = useState(false);
  const [imageScale] = useState(new Animated.Value(1));

  const loadWallpapers = () => {
    const search = 'naruto';
    axios
      .get(
        `https://api.unsplash.com/search/photos?query=${search}&client_id=KP-Lbluas59Bfo8HAm1sJr9pt0zF5vL3pRAHd3tdyrs`,
      )
      .then(res => {
        setData(res.data.results);
        setIsLoading(false);
      })
      .catch(err => console.log(err))
      .finally(() => console.log('request completed'));
  };

  const scale = {
    transform: [{scale: imageScale}],
  };

  const actionBarY = imageScale.interpolate({
    inputRange: [0.9, 1],
    outputRange: [0, -80],
  });

  const showControls = () => {
    setIsImageFocused(!isImageFocused);
    if (isImageFocused) {
      Animated.spring(imageScale, {
        toValue: 0.9,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.spring(imageScale, {
        toValue: 1,
        useNativeDriver: false,
      }).start();
    }
  };

  useEffect(() => {
    loadWallpapers();
  }, []);

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const getPermissionAndroid = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Confirm',
          message: 'Save to your Gallery',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }
      Alert.alert(
        'Permission required',
        'Permission is required to save images to your device',
        [{text: 'OK', onPress: () => {}}],
        {cancelable: false},
      );
    } catch (err) {
      console.log(err);
    }
  };

  const saveToCameraRoll = imageUrl => {
    if (!getPermissionAndroid) {
      return false;
    }
    console.log(imageUrl);
    var date = new Date();
    var image_URL = imageUrl;
    const ext = '.png';
    const {config, fs} = RNFetchBlob;
    let PictureDir = fs.dirs.PictureDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path:
          PictureDir +
          '/image_' +
          Math.floor(date.getTime() + date.getSeconds() / 2) +
          ext,
        description: 'Image',
      },
    };
    config(options)
      .fetch('GET', image_URL)
      .then(() => {
        Alert.alert('Image Downloaded to your Gallery.');
      });
  };

  const renderImage = ({item}) => (
    <>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'black',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator size="large" color="grey" />
      </View>
      <TouchableWithoutFeedback onPress={showControls}>
        <Animated.View
          style={[{height: windowHeight, width: windowWidth}, scale]}>
          <Image
            style={{height: '100%', width: '100%'}}
            source={{uri: item.urls.full}}
            resizeMode="cover"
          />
        </Animated.View>
      </TouchableWithoutFeedback>
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: actionBarY,
          backgroundColor: 'black',
          height: 80,
        }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'space-around',
            alignItems: 'center',
            flexDirection: 'row',
          }}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => loadWallpapers()}>
            <Icon name="refresh" size={30} color="#900" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => saveToCameraRoll(item.urls.full)}>
            <Icon name="download" size={30} color="#900" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );

  return isLoading ? (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="grey" />
    </View>
  ) : (
    <View style={styles.container}>
      <StatusBar
        //translucent
        barStyle="light-content"
        backgroundColor="black"
      />
      <FlatList
        scrollEnabled={isImageFocused}
        horizontal
        pagingEnabled
        data={data}
        renderItem={renderImage}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
