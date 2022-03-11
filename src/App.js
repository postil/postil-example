import './App.css';
import React from 'react';
import axios from 'axios';
import Select from 'react-select'

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCity: null,
      isLoadingCities: true,
      cities: [],
      selectedStreet: null,
      isLoadingStreets: false,
      streets: [],
      selectedHouse: null,
      isLoadingHouses: false,
      houses: [],
    };
  }

  handleCityChange = (selectedCity) => {
    console.log(`City set to ${selectedCity.label}`);
    this.setState({
      selectedCity: selectedCity,
      isLoadingStreets: true,
      streets: [],
      selectedStreet: null,
      houses: [],
      selectedHouse: null,
    });

    axios
      .get(`https://raw.githubusercontent.com/postil/data/main/${encodeURIComponent(selectedCity.label)}/streets.json`)
      .then(resp => {
        console.log(resp);
        this.setState({
          isLoadingStreets: false,
          streets: resp.data,
        });
      })
    .catch(error => {
      console.log(`error: ${error}`);
    });
  }

  handleStreetChange = (selectedStreet) => {
    console.log(`Street set to ${selectedStreet.label}`);
    this.setState({
      selectedStreet: selectedStreet,
      isLoadingHouses: true,
      houses: [],
      selectedHouse: null,
    });

    axios
      .get(`https://raw.githubusercontent.com/postil/data/main/${encodeURIComponent(this.state.selectedCity.label)}/${encodeURIComponent(selectedStreet.label)}.json`)
      .then(resp => {
        console.log(resp);
        this.setState({
          houses: resp.data,
          isLoadingHouses: false,
        });
      })
    .catch(error => {
      console.log(`error: ${error}`);
    });
  }

  handleHouseChange = (selectedHouse) => {
    console.log(`House set to ${selectedHouse.label}`);
    this.setState({
      selectedHouse: selectedHouse,
    });
  }

  componentDidMount() {
    axios
      .get('https://raw.githubusercontent.com/postil/data/main/cities.json')
      .then(resp => {
        console.log(resp);
        this.setState({
          isLoadingCities: false,
          cities: resp.data,
        });
      })
    .catch(error => {
      console.log(`error: ${error}`);
    });
  }

  render() {
    const city_options = this.state.cities.map((city) => {
      return {value: city.name, label: city.name};
    });

    const street_options = this.state.streets.map((street) => {
      return {value: street.name, label: street.name};
    });

    const house_options = this.state.houses.map((house) => {
      return {value: house.n, label: house.n};
    });

    let city = undefined;
    if (this.state.selectedCity) {
      city = this.state.cities.find(city => city.name === this.state.selectedCity.label);
    }

    let street = undefined;
    if (this.state.selectedStreet) {
      street = this.state.streets.find(street => street.name === this.state.selectedStreet.label);
    }

    let house = undefined;
    if (this.state.selectedHouse) {
      house = this.state.houses.find(house => house.n === this.state.selectedHouse.label);
    }

    let entries = [];
    if (house && house.entries) {
      entries.push(<tr><td>כניסות נוספות לבית: <b>{house.entries.length}</b> (לכל כניסה מיקוד שונה)</td></tr>);
      for (let entry of house.entries) {
        entries.push(<tr><td>כניסה <b>{entry.entry}</b>, מיקוד <b>{entry.zip}</b>, נ.צ. <b>{entry.pos}</b></td></tr>);
      }
    }

    return (
      <div className="App">
        <h1>דמו Postil</h1>

        <Select
          options={city_options}
          onChange={this.handleCityChange}
          value={this.state.selectedCity}
          placeholder="יישוב..."
          isLoading={this.state.isLoadingCities}
          isDisabled={this.state.isLoadingCities}
        />

        <Select
          options={street_options}
          onChange={this.handleStreetChange}
          value={this.state.selectedStreet}
          placeholder="רחוב..."
          isLoading={this.state.isLoadingStreets}
          isDisabled={!this.state.selectedCity || this.state.isLoadingStreets}
        />

        <Select
          options={house_options}
          onChange={this.handleHouseChange}
          value={this.state.selectedHouse}
          placeholder="מספר בית..."
          isLoading={this.state.isLoadingHouses}
          isDisabled={!this.state.selectedCity || !this.state.selectedStreet || this.state.isLoadingHouses}
        />

        <table className="results">
          <tbody>
            {city ? <tr><td>יישוב <b>{city.name}</b>, סמל יישוב <b>{city.symbol}</b></td></tr> : undefined }
            {city && city.zipcode ? <tr><td>מיקוד היישוב <b>{city.zipcode}</b> (ביישוב זה מיקוד משותף לכל הבתים)</td></tr> : undefined }
            {street ? <tr><td>רחוב <b>{street.name}</b>, מספר בתים ברחוב <b>{street.houses}</b>, סמל רחוב <b>{street.symbol}</b></td></tr> : undefined }
            {house ? <tr><td>בית מספר <b>{house.n}</b>, מיקוד <b>{house.zip}</b>, נ.צ. <b>{house.pos}</b></td></tr> : undefined }
            {entries}
          </tbody>
        </table>

      </div>
    );
  }
}
