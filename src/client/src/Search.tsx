import React from "react";
import Banner from "./Banner";
import axios from "axios";
import { PropertyProps, Property } from "./Property";
import { filterDate } from "./objects/FilterDate";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";

interface FilterProps {
  type: number;
  locality: number;
  price: number;
  capacity: number;
}

interface NumericSelector {
  id: number;
  name: string;
}

interface PriceSelector {
  max: number;
  min: number;
}

@observer
class Search extends React.Component<
{},
{
  properties: Array<PropertyProps>,
  types: Array<NumericSelector>,
  localities: Array<NumericSelector>,
  capacities: Array<NumericSelector>,
  price: PriceSelector,
  filter: FilterProps,
  sorting: number,
  page: number,
}>
{
  constructor(props: Readonly<{}>) {
    super(props);

    this.state = {
      properties: [],
      types: [],
      localities: [],
      capacities: [],
      price: {
        max: -1,
        min: -1
      },
      filter: {
        type: -1,
        locality: -1,
        price: Number.MAX_VALUE,
        capacity: -1,
      },
      sorting: -1,
      page: 1,
    };

    this.getFilterOptions();
  }

  getFilterOptions = () => {
    axios.get("http://localhost:8080/filterOptions").then((res) => {
      this.setState(
        {
          types: res.data.types,
          localities: res.data.localities,
          capacities: res.data.capacities,
          price: res.data.price,
        },
        () => {
          this.getFilteredProperties();
        }
      );
    });
  };

  getFilteredProperties = () => {
    let filter = JSON.parse(JSON.stringify(this.state.filter));
    if (filter.price === Number.MAX_VALUE) {
      filter.price = -1;
    }
    let date = {
      from: new Date(filterDate.from).toISOString(),
      to: new Date(filterDate.to).toISOString()
    }

    axios
      .post("http://localhost:8080/filteredProperties", { filter: filter, date: date, sort: this.state.sorting })
      .then((res) => {
        this.setState({
          properties: res.data,
        });
      });
  };

  render() {
    return (
      <main data-barba="container">
        <div className="swipe swipe1"></div>
        <div className="swipe swipe2"></div>
        <div className="swipe swipe3"></div>

        <Banner />

        <h1>Filtr</h1>
        <div className="underline"></div>

        <section className="form-container">
          <form className="filter-form">
            <div className="form-group">
              <label htmlFor="type">Typ</label>
              <select
                name="type"
                id="type"
                value={this.state.filter.type}
                data-class="form-control"
                onChange={(e: React.FormEvent<HTMLSelectElement>) => {
                  let selectedType: number = Number(e.currentTarget.value);
                  this.setState(
                    {
                      filter: {
                        ...this.state.filter,
                        type: selectedType,
                      },
                    },
                    () => {
                      this.getFilteredProperties();
                    }
                  );
                }}
              >
                <option value={-1}>Libovolný</option>
                {this.state.types.map((i) => {
                  return (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Lokalita</label>
              <select
                name="location"
                id="location"
                value={this.state.filter.locality}
                data-class="form-control"
                onChange={(e: React.FormEvent<HTMLSelectElement>) => {
                  let selectedLocality: number = Number(e.currentTarget.value);
                  this.setState(
                    {
                      filter: {
                        ...this.state.filter,
                        locality: selectedLocality,
                      },
                    },
                    () => {
                      this.getFilteredProperties();
                    }
                  );
                }}
              >
                <option value={-1}>Libovolná</option>
                {this.state.localities.map((i) => {
                  return (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Datum</label>
              <div className="date-inputs">
                <input
                  type="date"
                  name="date-arrival"
                  id="date"
                  value={filterDate.from}
                  data-class="form-input"
                  onChange={(e: React.FormEvent<HTMLInputElement>) => {
                    let selectedDate: string = new Date(e.currentTarget.value)
                      .toISOString()
                      .split("T")[0];

                    // older than current date
                    if (
                      Date.parse(new Date().toISOString().split("T")[0]) >
                      Date.parse(selectedDate)
                    ) {
                      return;
                    }
                    // bigger than 'to' date
                    if (
                      Date.parse(selectedDate) >=
                      Date.parse(filterDate.to)
                    ) {
                      return;
                    }

                    filterDate.from = selectedDate;
                    this.getFilteredProperties();
                  }}
                />
                <input
                  type="date"
                  name="date-departure"
                  id="date"
                  value={filterDate.to}
                  data-class="form-input"
                  onChange={(e: React.FormEvent<HTMLInputElement>) => {
                    let selectedDate: string = new Date(e.currentTarget.value)
                      .toISOString()
                      .split("T")[0];

                    // older than from date
                    if (
                      Date.parse(filterDate.from) >=
                      Date.parse(selectedDate)
                    ) {
                      return;
                    }

                    filterDate.to = selectedDate;
                    this.getFilteredProperties();
                  }}
                  />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="price">
                Max cena:{" "}
                {this.state.filter.price === Number.MAX_VALUE
                  ? "libovolná"
                  : this.state.filter.price}
              </label>
              <input
                type="range"
                name="price"
                id="price"
                value={this.state.filter.price}
                min={this.state.price.min}
                max={this.state.price.max}
                data-class="form-control"
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  let selectedPrice: number = Number(e.currentTarget.value);
                  if (selectedPrice === this.state.price.max) {
                    this.setState({ filter: { ...this.state.filter, price: Number.MAX_VALUE } },
                      () => {
                        this.getFilteredProperties();
                      }
                    );
                    return;
                  }
                  this.setState(
                    {
                      filter: {
                        ...this.state.filter,
                        price: selectedPrice,
                      },
                    },
                    () => {
                      this.getFilteredProperties();
                    }
                  );
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Počet hostů</label>
              <select
                name="capacity"
                id="capacity"
                value={this.state.filter.capacity}
                data-class="form-control"
                onChange={(e: React.FormEvent<HTMLSelectElement>) => {
                  let selectedCapacity: number = Number(e.currentTarget.value);
                  this.setState(
                    {
                      filter: {
                        ...this.state.filter,
                        capacity: selectedCapacity,
                      },
                    },
                    () => {
                      this.getFilteredProperties();
                    }
                  );
                }}
              >
                <option value={-1}>libovolný</option>
                {this.state.capacities.map((i) => {
                  return (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Řazení</label>
              <select
                name="sorting"
                id="sorting"
                value={this.state.sorting}
                data-class="form-control"
                onChange={(e: React.FormEvent<HTMLSelectElement>) => {
                  this.setState(
                    {
                      sorting: Number(e.currentTarget.value)
                    },
                    () => {
                      this.getFilteredProperties();
                    }
                  );
                }}
              >
                <option value="0">Datum (nejstarší)</option>
                <option value="1">Datum (nejnovější)</option>
                <option value="2">Cena (nejlevnější)</option>
                <option value="3">Cena (nejdražší)</option>
                <option value="4">Počet hostů (méně)</option>
                <option value="5">Počet hostů (více)</option>
                })}
              </select>
            </div>
          </form>
        </section>

        <section className="rooms">
          {this.state.properties.slice(0, this.state.page * 6).map((property: PropertyProps) => {
            return <Property key={property.p_id} {...property} />;
          })}
        </section>
        <div className="margin-wrapper">
          {(this.state.properties.length - (this.state.page * 6) > 0) 
            ? <Link to={window.location.pathname} className="primary-btn" onClick={() => { this.setState({ page: this.state.page + 1 }) }}>Načíst další</Link>
            : ""
          }
        </div>
      </main>
    );
  }
}

export default Search;
