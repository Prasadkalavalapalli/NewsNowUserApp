// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
//   SafeAreaView,
//   StatusBar,
//   TextInput,
//   Image,
//   Platform,
//   ActivityIndicator,
//   Modal,
//   KeyboardAvoidingView,
//   PermissionsAndroid,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome6';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import * as ImagePicker from 'react-native-image-picker';
// import Geolocation from '@react-native-community/geolocation';
// import { pallette } from '../helpers/colors';
// import { regular, medium, semibold, bold } from '../helpers/fonts';
// import { h, w, adjust } from '../../constants/dimensions';
// import ToastMessage from '../helpers/ToastMessage';
// import { newsAPI } from '../../Axios/Api';
// import DropDownPicker from 'react-native-dropdown-picker';

// const UploadNewsScreen = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const scrollViewRef = useRef();

//   // Form states
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [toast, setToast] = useState(null);
  
//   // Media states
//   const [images, setImages] = useState([]);
//   const [videos, setVideos] = useState([]);
//   const [selectedMediaType, setSelectedMediaType] = useState('image'); // 'image' or 'video'
  
//   // Form fields
//   const [headline, setHeadline] = useState('');
//   const [description, setDescription] = useState('');
//   const [category, setCategory] = useState(null);
//   const [newsType, setNewsType] = useState(null);
//   const [location, setLocation] = useState({
//     address: '',
//     city: '',
//     state: '',
//     pincode: '',
//     coordinates: null, // {latitude, longitude}
//   });
//   const [reporterDetails, setReporterDetails] = useState({
//     name: '',
//     phone: '',
//     email: '',
//     idProof: '',
//   });
//   const [tags, setTags] = useState('');
//   const [source, setSource] = useState('');
//   const [isBreakingNews, setIsBreakingNews] = useState(false);
//   const [isLiveNews, setIsLiveNews] = useState(false);
//   const [liveStreamUrl, setLiveStreamUrl] = useState('');
  
//   // Dropdown states
//   const [categoryOpen, setCategoryOpen] = useState(false);
//   const [newsTypeOpen, setNewsTypeOpen] = useState(false);
  
//   // Categories
//   const [categories, setCategories] = useState([
//     { label: 'Breaking News', value: 'breaking' },
//     { label: 'Politics', value: 'politics' },
//     { label: 'Sports', value: 'sports' },
//     { label: 'Entertainment', value: 'entertainment' },
//     { label: 'Technology', value: 'technology' },
//     { label: 'Business', value: 'business' },
//     { label: 'Health', value: 'health' },
//     { label: 'Education', value: 'education' },
//     { label: 'Crime', value: 'crime' },
//     { label: 'Environment', value: 'environment' },
//     { label: 'International', value: 'international' },
//     { label: 'Local', value: 'local' },
//     { label: 'Other', value: 'other' },
//   ]);
  
//   // News types
//   const [newsTypes, setNewsTypes] = useState([
//     { label: 'Normal News', value: 'normal' },
//     { label: 'Breaking News', value: 'breaking' },
//     { label: 'Live News', value: 'live' },
//     { label: 'Exclusive', value: 'exclusive' },
//     { label: 'Investigative', value: 'investigative' },
//     { label: 'Feature', value: 'feature' },
//     { label: 'Opinion', value: 'opinion' },
//   ]);

//   // Modal for image viewer
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedImageIndex, setSelectedImageIndex] = useState(0);

//   useEffect(() => {
//     // Load reporter details if available from route params
//     if (route.params?.reporter) {
//       setReporterDetails(prev => ({
//         ...prev,
//         name: route.params.reporter.name || '',
//         phone: route.params.reporter.phone || '',
//         email: route.params.reporter.email || '',
//       }));
//     }

//     // Request location permission
//     requestLocationPermission();
    
//     // Get current location
//     getCurrentLocation();
//   }, []);

//   const requestLocationPermission = async () => {
//     if (Platform.OS === 'android') {
//       try {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//           {
//             title: 'Location Permission',
//             message: 'This app needs access to your location',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           }
//         );
//         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//           getCurrentLocation();
//         }
//       } catch (err) {
//         console.warn(err);
//       }
//     } else {
//       getCurrentLocation();
//     }
//   };

//   const getCurrentLocation = () => {
//     Geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         setLocation(prev => ({
//           ...prev,
//           coordinates: { latitude, longitude }
//         }));
//       },
//       (error) => {
//         console.error('Location error:', error);
//         setToast({
//           message: 'Unable to get current location',
//           type: 'warning'
//         });
//       },
//       { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
//     );
//   };

//   const handleBackPress = () => {
//     if (headline || description || images.length > 0 || videos.length > 0) {
//       Alert.alert(
//         'Discard Changes',
//         'You have unsaved changes. Are you sure you want to go back?',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
//         ]
//       );
//     } else {
//       navigation.goBack();
//     }
//   };

//   const handleSelectImages = () => {
//     const options = {
//       mediaType: 'photo',
//       selectionLimit: 10 - images.length,
//       quality: 0.8,
//       includeBase64: false,
//     };

//     ImagePicker.launchImageLibrary(options, (response) => {
//       if (response.didCancel) {
//         console.log('User cancelled image picker');
//       } else if (response.error) {
//         console.error('ImagePicker Error: ', response.error);
//         setToast({
//           message: 'Failed to select images',
//           type: 'error'
//         });
//       } else if (response.assets) {
//         const newImages = response.assets.map(asset => ({
//           uri: asset.uri,
//           name: asset.fileName || `image_${Date.now()}.jpg`,
//           type: asset.type || 'image/jpeg',
//           size: asset.fileSize,
//           width: asset.width,
//           height: asset.height,
//         }));

//         setImages(prev => [...prev, ...newImages].slice(0, 10)); // Limit to 10 images
//         setSelectedMediaType('image');
//       }
//     });
//   };

//   const handleSelectVideos = () => {
//     const options = {
//       mediaType: 'video',
//       selectionLimit: 1,
//       videoQuality: 'medium',
//       includeBase64: false,
//     };

//     ImagePicker.launchImageLibrary(options, (response) => {
//       if (response.didCancel) {
//         console.log('User cancelled video picker');
//       } else if (response.error) {
//         console.error('ImagePicker Error: ', response.error);
//         setToast({
//           message: 'Failed to select video',
//           type: 'error'
//         });
//       } else if (response.assets && response.assets.length > 0) {
//         const asset = response.assets[0];
//         const newVideo = {
//           uri: asset.uri,
//           name: asset.fileName || `video_${Date.now()}.mp4`,
//           type: asset.type || 'video/mp4',
//           size: asset.fileSize,
//           duration: asset.duration,
//           width: asset.width,
//           height: asset.height,
//         };

//         setVideos([newVideo]); // Only one video for now
//         setSelectedMediaType('video');
//       }
//     });
//   };

//   const handleCaptureImage = () => {
//     const options = {
//       mediaType: 'photo',
//       quality: 0.8,
//       includeBase64: false,
//       saveToPhotos: true,
//     };

//     ImagePicker.launchCamera(options, (response) => {
//       if (response.didCancel) {
//         console.log('User cancelled camera');
//       } else if (response.error) {
//         console.error('Camera Error: ', response.error);
//         setToast({
//           message: 'Failed to capture image',
//           type: 'error'
//         });
//       } else if (response.assets && response.assets.length > 0) {
//         const asset = response.assets[0];
//         const newImage = {
//           uri: asset.uri,
//           name: `captured_${Date.now()}.jpg`,
//           type: asset.type || 'image/jpeg',
//           size: asset.fileSize,
//           width: asset.width,
//           height: asset.height,
//         };

//         setImages(prev => [...prev, newImage].slice(0, 10));
//         setSelectedMediaType('image');
//       }
//     });
//   };

//   const handleCaptureVideo = () => {
//     const options = {
//       mediaType: 'video',
//       videoQuality: 'medium',
//       durationLimit: 300, // 5 minutes max
//       includeBase64: false,
//       saveToPhotos: true,
//     };

//     ImagePicker.launchCamera(options, (response) => {
//       if (response.didCancel) {
//         console.log('User cancelled video recording');
//       } else if (response.error) {
//         console.error('Camera Error: ', response.error);
//         setToast({
//           message: 'Failed to record video',
//           type: 'error'
//         });
//       } else if (response.assets && response.assets.length > 0) {
//         const asset = response.assets[0];
//         const newVideo = {
//           uri: asset.uri,
//           name: `recorded_${Date.now()}.mp4`,
//           type: asset.type || 'video/mp4',
//           size: asset.fileSize,
//           duration: asset.duration,
//           width: asset.width,
//           height: asset.height,
//         };

//         setVideos([newVideo]);
//         setSelectedMediaType('video');
//       }
//     });
//   };

//   const handleRemoveImage = (index) => {
//     setImages(prev => prev.filter((_, i) => i !== index));
//   };

//   const handleRemoveVideo = () => {
//     setVideos([]);
//   };

//   const handleSelectLocation = () => {
//     navigation.navigate('LocationPicker', {
//       onLocationSelect: (selectedLocation) => {
//         setLocation(selectedLocation);
//       }
//     });
//   };

//   const handleSelectReporter = () => {
//     navigation.navigate('ReporterList', {
//       onReporterSelect: (reporter) => {
//         setReporterDetails({
//           name: reporter.name,
//           phone: reporter.phone,
//           email: reporter.email,
//           idProof: reporter.idProofNumber || '',
//         });
//       }
//     });
//   };

//   const handleUpload = async () => {
//     // Validation
//     if (!headline.trim()) {
//       setToast({ message: 'Please enter headline', type: 'error' });
//       scrollViewRef.current?.scrollTo({ y: 0, animated: true });
//       return;
//     }

//     if (!description.trim()) {
//       setToast({ message: 'Please enter description', type: 'error' });
//       return;
//     }

//     if (!category) {
//       setToast({ message: 'Please select category', type: 'error' });
//       return;
//     }

//     if (!newsType) {
//       setToast({ message: 'Please select news type', type: 'error' });
//       return;
//     }

//     if (images.length === 0 && videos.length === 0) {
//       setToast({ message: 'Please add at least one image or video', type: 'error' });
//       return;
//     }

//     if (isLiveNews && !liveStreamUrl.trim()) {
//       setToast({ message: 'Please enter live stream URL for live news', type: 'error' });
//       return;
//     }

//     Alert.alert(
//       'Upload News',
//       'Are you sure you want to upload this news?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Upload',
//           onPress: async () => {
//             try {
//               setUploading(true);

//               // Create form data
//               const formData = new FormData();

//               // Add images
//               images.forEach((image, index) => {
//                 formData.append('images', {
//                   uri: image.uri,
//                   type: image.type || 'image/jpeg',
//                   name: image.name,
//                 });
//               });

//               // Add videos
//               videos.forEach((video, index) => {
//                 formData.append('videos', {
//                   uri: video.uri,
//                   type: video.type || 'video/mp4',
//                   name: video.name,
//                 });
//               });

//               // Add text fields
//               formData.append('headline', headline);
//               formData.append('description', description);
//               formData.append('category', category);
//               formData.append('newsType', newsType);
//               formData.append('tags', tags);
//               formData.append('source', source);
//               formData.append('isBreakingNews', isBreakingNews);
//               formData.append('isLiveNews', isLiveNews);
//               formData.append('liveStreamUrl', liveStreamUrl);
              
//               // Add location
//               formData.append('location', JSON.stringify(location));
              
//               // Add reporter details
//               formData.append('reporterDetails', JSON.stringify(reporterDetails));

//               const response = await newsAPI.uploadNews(formData);

//               if (response.success) {
//                 setToast({
//                   message: 'News uploaded successfully!',
//                   type: 'success'
//                 });

//                 // Reset form after successful upload
//                 setTimeout(() => {
//                   resetForm();
//                   navigation.navigate('NewsList', { refresh: true });
//                 }, 1500);
//               } else {
//                 throw new Error(response.message || 'Upload failed');
//               }
//             } catch (error) {
//               console.error('Upload error:', error);
//               setToast({
//                 message: error.message || 'Failed to upload news',
//                 type: 'error'
//               });
//             } finally {
//               setUploading(false);
//             }
//           }
//         }
//       ]
//     );
//   };

//   const resetForm = () => {
//     setHeadline('');
//     setDescription('');
//     setCategory(null);
//     setNewsType(null);
//     setImages([]);
//     setVideos([]);
//     setLocation({
//       address: '',
//       city: '',
//       state: '',
//       pincode: '',
//       coordinates: null,
//     });
//     setReporterDetails({
//       name: '',
//       phone: '',
//       email: '',
//       idProof: '',
//     });
//     setTags('');
//     setSource('');
//     setIsBreakingNews(false);
//     setIsLiveNews(false);
//     setLiveStreamUrl('');
//   };

//   const openImageModal = (index) => {
//     setSelectedImageIndex(index);
//     setModalVisible(true);
//   };

//   const renderMediaPreview = () => {
//     if (videos.length > 0) {
//       return (
//         <View style={styles.videoContainer}>
//           <TouchableOpacity 
//             style={styles.removeMediaButton}
//             onPress={handleRemoveVideo}
//           >
//             <Icon name="xmark" size={16} color={pallette.white} />
//           </TouchableOpacity>
//           <View style={styles.videoPlaceholder}>
//             <Icon name="video" size={40} color={pallette.primary} />
//             <Text style={styles.videoText}>{videos[0].name}</Text>
//             <Text style={styles.videoSize}>
//               {videos[0].size ? `${(videos[0].size / (1024 * 1024)).toFixed(2)} MB` : 'Size unknown'}
//             </Text>
//             <Text style={styles.videoDuration}>
//               {videos[0].duration ? `${Math.floor(videos[0].duration / 60)}:${(videos[0].duration % 60).toString().padStart(2, '0')}` : ''}
//             </Text>
//           </View>
//         </View>
//       );
//     }

//     if (images.length > 0) {
//       return (
//         <ScrollView 
//           horizontal 
//           showsHorizontalScrollIndicator={false}
//           style={styles.imagesContainer}
//         >
//           {images.map((image, index) => (
//             <View key={index} style={styles.imageWrapper}>
//               <TouchableOpacity 
//                 style={styles.removeImageButton}
//                 onPress={() => handleRemoveImage(index)}
//               >
//                 <Icon name="xmark" size={14} color={pallette.white} />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => openImageModal(index)}>
//                 <Image source={{ uri: image.uri }} style={styles.previewImage} />
//               </TouchableOpacity>
//             </View>
//           ))}
//         </ScrollView>
//       );
//     }

//     return null;
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={pallette.white} />
      
//       {/* Toast Message */}
//       {toast && (
//         <ToastMessage
//           message={toast.message}
//           type={toast.type}
//           onClose={() => setToast(null)}
//         />
//       )}

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
//           <Icon name="arrow-left" size={adjust(20)} color={pallette.black} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Upload News</Text>
//         <View style={styles.headerRight} />
//       </View>

//       <KeyboardAvoidingView 
//         style={styles.keyboardView}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <ScrollView 
//           ref={scrollViewRef}
//           style={styles.scrollView}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.scrollContent}
//         >
//           {/* Media Upload Section */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>
//               Upload Media <Text style={styles.required}>*</Text>
//             </Text>
            
//             {/* Media Type Selector */}
//             <View style={styles.mediaTypeSelector}>
//               <TouchableOpacity
//                 style={[
//                   styles.mediaTypeButton,
//                   selectedMediaType === 'image' && styles.mediaTypeButtonActive
//                 ]}
//                 onPress={() => setSelectedMediaType('image')}
//               >
//                 <Icon 
//                   name="image" 
//                   size={20} 
//                   color={selectedMediaType === 'image' ? pallette.white : pallette.grey} 
//                 />
//                 <Text style={[
//                   styles.mediaTypeText,
//                   selectedMediaType === 'image' && styles.mediaTypeTextActive
//                 ]}>
//                   Images ({images.length}/10)
//                 </Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[
//                   styles.mediaTypeButton,
//                   selectedMediaType === 'video' && styles.mediaTypeButtonActive
//                 ]}
//                 onPress={() => setSelectedMediaType('video')}
//               >
//                 <Icon 
//                   name="video" 
//                   size={20} 
//                   color={selectedMediaType === 'video' ? pallette.white : pallette.grey} 
//                 />
//                 <Text style={[
//                   styles.mediaTypeText,
//                   selectedMediaType === 'video' && styles.mediaTypeTextActive
//                 ]}>
//                   Video ({videos.length}/1)
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {/* Media Preview */}
//             {renderMediaPreview()}

//             {/* Media Actions */}
//             <View style={styles.mediaActions}>
//               <TouchableOpacity 
//                 style={styles.mediaActionButton}
//                 onPress={selectedMediaType === 'image' ? handleSelectImages : handleSelectVideos}
//               >
//                 <Icon name="folder-open" size={18} color={pallette.primary} />
//                 <Text style={styles.mediaActionText}>Choose from Gallery</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity 
//                 style={styles.mediaActionButton}
//                 onPress={selectedMediaType === 'image' ? handleCaptureImage : handleCaptureVideo}
//               >
//                 <Icon name="camera" size={18} color={pallette.primary} />
//                 <Text style={styles.mediaActionText}>
//                   {selectedMediaType === 'image' ? 'Take Photo' : 'Record Video'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
            
//             <Text style={styles.mediaHint}>
//               {selectedMediaType === 'image' 
//                 ? 'You can upload up to 10 images' 
//                 : 'You can upload 1 video (max 5 minutes)'}
//             </Text>
//           </View>

//           {/* Headline Section */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>
//               Headline <Text style={styles.required}>*</Text>
//             </Text>
//             <TextInput
//               style={styles.textInput}
//               value={headline}
//               onChangeText={setHeadline}
//               placeholder="Enter news headline"
//               placeholderTextColor={pallette.grey}
//               maxLength={200}
//               multiline
//             />
//             <Text style={styles.charCount}>{headline.length}/200</Text>
//           </View>

//           {/* Description Section */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>
//               Description <Text style={styles.required}>*</Text>
//             </Text>
//             <TextInput
//               style={[styles.textInput, styles.textArea]}
//               value={description}
//               onChangeText={setDescription}
//               placeholder="Enter detailed news description"
//               placeholderTextColor={pallette.grey}
//               multiline
//               numberOfLines={6}
//               textAlignVertical="top"
//             />
//           </View>

//           {/* Category & News Type */}
//           <View style={styles.rowSection}>
//             <View style={styles.halfSection}>
//               <Text style={styles.sectionTitle}>
//                 Category <Text style={styles.required}>*</Text>
//               </Text>
//               <DropDownPicker
//                 open={categoryOpen}
//                 value={category}
//                 items={categories}
//                 setOpen={setCategoryOpen}
//                 setValue={setCategory}
//                 setItems={setCategories}
//                 placeholder="Select category"
//                 style={styles.dropdown}
//                 textStyle={styles.dropdownText}
//                 dropDownContainerStyle={styles.dropdownContainer}
//                 zIndex={3000}
//                 zIndexInverse={1000}
//               />
//             </View>
            
//             <View style={styles.halfSection}>
//               <Text style={styles.sectionTitle}>
//                 News Type <Text style={styles.required}>*</Text>
//               </Text>
//               <DropDownPicker
//                 open={newsTypeOpen}
//                 value={newsType}
//                 items={newsTypes}
//                 setOpen={setNewsTypeOpen}
//                 setValue={setNewsType}
//                 setItems={setNewsTypes}
//                 placeholder="Select news type"
//                 style={styles.dropdown}
//                 textStyle={styles.dropdownText}
//                 dropDownContainerStyle={styles.dropdownContainer}
//                 zIndex={2000}
//                 zIndexInverse={2000}
//               />
//             </View>
//           </View>

//           {/* Breaking News & Live News Toggles */}
//           <View style={styles.section}>
//             <View style={styles.toggleRow}>
//               <TouchableOpacity
//                 style={[
//                   styles.toggleButton,
//                   isBreakingNews && styles.toggleButtonActive
//                 ]}
//                 onPress={() => setIsBreakingNews(!isBreakingNews)}
//               >
//                 <Icon 
//                   name="bolt" 
//                   size={16} 
//                   color={isBreakingNews ? pallette.white : pallette.primary} 
//                 />
//                 <Text style={[
//                   styles.toggleText,
//                   isBreakingNews && styles.toggleTextActive
//                 ]}>
//                   Breaking News
//                 </Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[
//                   styles.toggleButton,
//                   isLiveNews && styles.toggleButtonActive
//                 ]}
//                 onPress={() => setIsLiveNews(!isLiveNews)}
//               >
//                 <Icon 
//                   name="signal" 
//                   size={16} 
//                   color={isLiveNews ? pallette.white : pallette.primary} 
//                 />
//                 <Text style={[
//                   styles.toggleText,
//                   isLiveNews && styles.toggleTextActive
//                 ]}>
//                   Live News
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {isLiveNews && (
//               <View style={styles.liveUrlContainer}>
//                 <Text style={styles.sectionTitle}>Live Stream URL</Text>
//                 <TextInput
//                   style={styles.textInput}
//                   value={liveStreamUrl}
//                   onChangeText={setLiveStreamUrl}
//                   placeholder="Enter live stream URL (YouTube, Facebook, etc.)"
//                   placeholderTextColor={pallette.grey}
//                 />
//               </View>
//             )}
//           </View>

//           {/* Location Section */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>Location Details</Text>
//               <TouchableOpacity 
//                 style={styles.locationButton}
//                 onPress={handleSelectLocation}
//               >
//                 <Icon name="location-crosshairs" size={16} color={pallette.primary} />
//                 <Text style={styles.locationButtonText}>Use Current</Text>
//               </TouchableOpacity>
//             </View>
            
//             <TextInput
//               style={styles.textInput}
//               value={location.address}
//               onChangeText={(text) => setLocation(prev => ({ ...prev, address: text }))}
//               placeholder="Address"
//               placeholderTextColor={pallette.grey}
//             />
            
//             <View style={styles.rowInputs}>
//               <TextInput
//                 style={[styles.textInput, styles.halfInput]}
//                 value={location.city}
//                 onChangeText={(text) => setLocation(prev => ({ ...prev, city: text }))}
//                 placeholder="City"
//                 placeholderTextColor={pallette.grey}
//               />
//               <TextInput
//                 style={[styles.textInput, styles.halfInput]}
//                 value={location.state}
//                 onChangeText={(text) => setLocation(prev => ({ ...prev, state: text }))}
//                 placeholder="State"
//                 placeholderTextColor={pallette.grey}
//               />
//             </View>
            
//             <TextInput
//               style={styles.textInput}
//               value={location.pincode}
//               onChangeText={(text) => setLocation(prev => ({ ...prev, pincode: text }))}
//               placeholder="Pincode"
//               placeholderTextColor={pallette.grey}
//               keyboardType="numeric"
//               maxLength={6}
//             />
//           </View>

//           {/* Reporter Details Section */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>Reporter Details</Text>
//               <TouchableOpacity 
//                 style={styles.locationButton}
//                 onPress={handleSelectReporter}
//               >
//                 <Icon name="user" size={16} color={pallette.primary} />
//                 <Text style={styles.locationButtonText}>Select</Text>
//               </TouchableOpacity>
//             </View>
            
//             <TextInput
//               style={styles.textInput}
//               value={reporterDetails.name}
//               onChangeText={(text) => setReporterDetails(prev => ({ ...prev, name: text }))}
//               placeholder="Reporter Name"
//               placeholderTextColor={pallette.grey}
//             />
            
//             <View style={styles.rowInputs}>
//               <TextInput
//                 style={[styles.textInput, styles.halfInput]}
//                 value={reporterDetails.phone}
//                 onChangeText={(text) => setReporterDetails(prev => ({ ...prev, phone: text }))}
//                 placeholder="Phone Number"
//                 placeholderTextColor={pallette.grey}
//                 keyboardType="phone-pad"
//               />
//               <TextInput
//                 style={[styles.textInput, styles.halfInput]}
//                 value={reporterDetails.email}
//                 onChangeText={(text) => setReporterDetails(prev => ({ ...prev, email: text }))}
//                 placeholder="Email"
//                 placeholderTextColor={pallette.grey}
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//               />
//             </View>
            
//             <TextInput
//               style={styles.textInput}
//               value={reporterDetails.idProof}
//               onChangeText={(text) => setReporterDetails(prev => ({ ...prev, idProof: text }))}
//               placeholder="ID Proof Number"
//               placeholderTextColor={pallette.grey}
//             />
//           </View>

//           {/* Tags & Source */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Tags</Text>
//             <TextInput
//               style={styles.textInput}
//               value={tags}
//               onChangeText={setTags}
//               placeholder="Enter tags (comma separated)"
//               placeholderTextColor={pallette.grey}
//             />
            
//             <Text style={styles.sectionTitle}>Source</Text>
//             <TextInput
//               style={styles.textInput}
//               value={source}
//               onChangeText={setSource}
//               placeholder="Enter news source"
//               placeholderTextColor={pallette.grey}
//             />
//           </View>

//           {/* Upload Button */}
//           <TouchableOpacity 
//             style={[
//               styles.uploadButton,
//               uploading && styles.uploadButtonDisabled
//             ]}
//             onPress={handleUpload}
//             disabled={uploading}
//           >
//             {uploading ? (
//               <ActivityIndicator size="small" color={pallette.white} />
//             ) : (
//               <>
//                 <Icon name="cloud-upload" size={20} color={pallette.white} />
//                 <Text style={styles.uploadButtonText}>Upload News</Text>
//               </>
//             )}
//           </TouchableOpacity>

//           <View style={styles.bottomSpacer} />
//         </ScrollView>
//       </KeyboardAvoidingView>

//       {/* Image Viewer Modal */}
//       <Modal
//         visible={modalVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <TouchableOpacity 
//             style={styles.modalCloseButton}
//             onPress={() => setModalVisible(false)}
//           >
//             <Icon name="xmark" size={24} color={pallette.white} />
//           </TouchableOpacity>
//           <Image 
//             source={{ uri: images[selectedImageIndex]?.uri }} 
//             style={styles.modalImage}
//             resizeMode="contain"
//           />
//           <View style={styles.imageCounter}>
//             <Text style={styles.imageCounterText}>
//               {selectedImageIndex + 1} / {images.length}
//             </Text>
//           </View>
//           {images.length > 1 && (
//             <>
//               <TouchableOpacity 
//                 style={[styles.navButton, styles.prevButton]}
//                 onPress={() => setSelectedImageIndex(prev => 
//                   prev === 0 ? images.length - 1 : prev - 1
//                 )}
//               >
//                 <Icon name="chevron-left" size={24} color={pallette.white} />
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={[styles.navButton, styles.nextButton]}
//                 onPress={() => setSelectedImageIndex(prev => 
//                   prev === images.length - 1 ? 0 : prev + 1
//                 )}
//               >
//                 <Icon name="chevron-right" size={24} color={pallette.white} />
//               </TouchableOpacity>
//             </>
//           )}
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: pallette.lightgrey,
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: pallette.white,
//     paddingHorizontal: w * 0.04,
//     paddingVertical: h * 0.02,
//     borderBottomWidth: 1,
//     borderBottomColor: pallette.lightgrey,
//   },
//   backButton: {
//     padding: 4,
//   },
//   headerTitle: {
//     fontSize: adjust(18),
//     fontFamily: bold,
//     color: pallette.black,
//   },
//   headerRight: {
//     width: 28,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: h * 0.02,
//   },
//   section: {
//     backgroundColor: pallette.white,
//     marginHorizontal: w * 0.04,
//     marginBottom: h * 0.02,
//     borderRadius: 12,
//     padding: w * 0.04,
//     shadowColor: pallette.black,
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   rowSection: {
//     flexDirection: 'row',
//     backgroundColor: pallette.white,
//     marginHorizontal: w * 0.04,
//     marginBottom: h * 0.02,
//     borderRadius: 12,
//     padding: w * 0.04,
//     shadowColor: pallette.black,
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 2,
//     gap: 12,
//   },
//   halfSection: {
//     flex: 1,
//   },
//   sectionTitle: {
//     fontSize: adjust(16),
//     fontFamily: semibold,
//     color: pallette.black,
//     marginBottom: h * 0.015,
//   },
//   required: {
//     color: pallette.red,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: h * 0.015,
//   },
//   mediaTypeSelector: {
//     flexDirection: 'row',
//     backgroundColor: pallette.lightgrey,
//     borderRadius: 8,
//     padding: 4,
//     marginBottom: h * 0.02,
//   },
//   mediaTypeButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     borderRadius: 6,
//     gap: 8,
//   },
//   mediaTypeButtonActive: {
//     backgroundColor: pallette.primary,
//   },
//   mediaTypeText: {
//     fontSize: adjust(14),
//     fontFamily: medium,
//     color: pallette.grey,
//   },
//   mediaTypeTextActive: {
//     color: pallette.white,
//   },
//   imagesContainer: {
//     marginBottom: h * 0.02,
//   },
//   imageWrapper: {
//     position: 'relative',
//     marginRight: 10,
//   },
//   previewImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//   },
//   removeImageButton: {
//     position: 'absolute',
//     top: -8,
//     right: -8,
//     backgroundColor: pallette.red,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1,
//   },
//   videoContainer: {
//     position: 'relative',
//     marginBottom: h * 0.02,
//   },
//   videoPlaceholder: {
//     width: '100%',
//     height: 150,
//     backgroundColor: pallette.lightgrey,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//   },
//   videoText: {
//     fontSize: adjust(14),
//     fontFamily: medium,
//     color: pallette.black,
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   videoSize: {
//     fontSize: adjust(12),
//     fontFamily: regular,
//     color: pallette.grey,
//     marginTop: 4,
//   },
//   videoDuration: {
//     fontSize: adjust(12),
//     fontFamily: regular,
//     color: pallette.primary,
//     marginTop: 2,
//   },
//   removeMediaButton: {
//     position: 'absolute',
//     top: -8,
//     right: -8,
//     backgroundColor: pallette.red,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1,
//   },
//   mediaActions: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: h * 0.01,
//   },
//   mediaActionButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     borderWidth: 1,
//     borderColor: pallette.primary,
//     borderRadius: 8,
//     gap: 8,
//   },
//   mediaActionText: {
//     fontSize: adjust(14),
//     fontFamily: medium,
//     color: pallette.primary,
//   },
//   mediaHint: {
//     fontSize: adjust(12),
//     fontFamily: regular,
//     color: pallette.grey,
//     textAlign: 'center',
//     marginTop: 8,
//   },
//   textInput: {
//     borderWidth: 1,
//     borderColor: pallette.lightgrey,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     fontSize: adjust(14),
//     fontFamily: regular,
//     color: pallette.black,
//     backgroundColor: pallette.white,
//   },
//   textArea: {
//     minHeight: 120,
//     textAlignVertical: 'top',
//   },
//   charCount: {
//     textAlign: 'right',
//     fontSize: adjust(12),
//     fontFamily: regular,
//     color: pallette.grey,
//     marginTop: 4,
//   },
//   dropdown: {
//     borderWidth: 1,
//     borderColor: pallette.lightgrey,
//     borderRadius: 8,
//     backgroundColor: pallette.white,
//     minHeight: 50,
//   },
//   dropdownText: {
//     fontSize: adjust(14),
//     fontFamily: regular,
//     color: pallette.black,
//   },
//   dropdownContainer: {
//     borderWidth: 1,
//     borderColor: pallette.lightgrey,
//     borderRadius: 8,
//     marginTop: 2,
//   },
//   toggleRow: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: h * 0.02,
//   },
//   toggleButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: pallette.primary,
//     gap: 8,
//   },
//   toggleButtonActive: {
//     backgroundColor: pallette.primary,
//   },
//   toggleText: {
//     fontSize: adjust(14),
//     fontFamily: medium,
//     color: pallette.primary,
//   },
//   toggleTextActive: {
//     color: pallette.white,
//   },
//   liveUrlContainer: {
//     marginTop: h * 0.02,
//   },
//   locationButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//     backgroundColor: pallette.lightprimary,
//     gap: 6,
//   },
//   locationButtonText: {
//     fontSize: adjust(12),
//     fontFamily: medium,
//     color: pallette.primary,
//   },
//   rowInputs: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 12,
//   },
//   halfInput: {
//     flex: 1,
//   },
//   uploadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: pallette.primary,
//     marginHorizontal: w * 0.04,
//     paddingVertical: h * 0.018,
//     borderRadius: 12,
//     gap: 10,
//     marginTop: h * 0.02,
//   },
//   uploadButtonDisabled: {
//     opacity: 0.7,
//   },
//   uploadButtonText: {
//     fontSize: adjust(16),
//     fontFamily: semibold,
//     color: pallette.white,
//   },
//   bottomSpacer: {
//     height: h * 0.03,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.95)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalCloseButton: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     zIndex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalImage: {
//     width: '100%',
//     height: '70%',
//   },
//   imageCounter: {
//     position: 'absolute',
//     top: 40,
//     alignSelf: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   imageCounterText: {
//     color: pallette.white,
//     fontSize: adjust(14),
//     fontFamily: medium,
//   },
//   navButton: {
//     position: 'absolute',
//     top: '50%',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   prevButton: {
//     left: 20,
//   },
//   nextButton: {
//     right: 20,
//   },
// });

// export default UploadNewsScreen;