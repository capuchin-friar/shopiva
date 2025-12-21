
import { 
  NavigationContainer 
} from '@react-navigation/native';
import store from './redux/store';
import { 
  Provider,
} from 'react-redux';
import StackNavigator from './android/app/src/ce/reusables/Nav';


function App(){  
  
     
  return (
    
    <Provider store={store}>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </Provider> 

  );
}
export default App;



  