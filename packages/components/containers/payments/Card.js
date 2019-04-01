import React from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';
import { Row, Input, Select } from 'react-components';
import { range } from 'proton-shared/lib/helpers/array';

import { getFullList } from '../../helpers/countries';

const Card = ({ card, errors, onChange, loading }) => {
    const countries = getFullList().map(({ value, label: text }) => ({ value, text }));
    const handleChange = (key) => ({ target }) => onChange(key, target.value);
    const currentYear = new Date().getFullYear();
    const months = range(1, 13).map((i) => {
        const value = `0${i}`.slice(-2);
        return { text: value, value };
    });
    const years = range(currentYear, currentYear + 12).map((i) => {
        const value = i.toString();
        return { text: value, value };
    });

    return (
        <>
            <Row>
                <Input
                    value={card.fullname}
                    onChange={handleChange('fullname')}
                    placeholder={c('Placeholder').t`Name on Card`}
                    disabled={loading}
                    required
                />
                {errors.fullname ? errors.fullname : null}
            </Row>
            <Row>
                <Input
                    value={card.number}
                    onChange={handleChange('number')}
                    placeholder={c('Placeholder').t`Card Number`}
                    disabled={loading}
                    maxLength={20}
                    required
                />
                {errors.number ? errors.number : null}
            </Row>
            <Row>
                <div className="flex-autogrid">
                    <Select
                        value={card.month}
                        onChange={handleChange('month')}
                        className="flex-autogrid-item"
                        options={months}
                        disabled={loading}
                    />
                    <Select
                        value={card.year}
                        onChange={handleChange('year')}
                        className="flex-autogrid-item"
                        options={years}
                        disabled={loading}
                    />
                    {errors.month ? errors.month : null}
                    <Input
                        value={card.cvc}
                        onChange={handleChange('cvc')}
                        className="flex-autogrid-item"
                        placeholder={c('Placeholder').t`Security Code`}
                        disabled={loading}
                        required
                    />
                    {errors.cvc ? errors.cvc : null}
                </div>
            </Row>
            <Row>
                <div className="flex-autogrid">
                    <Input
                        value={card.zip}
                        onChange={handleChange('zip')}
                        className="flex-autogrid-item"
                        placeholder={c('Placeholder').t`ZIP/Postal Code`}
                        disabled={loading}
                        minLength={3}
                        maxLength={9}
                        required
                    />
                    {errors.zip ? errors.zip : null}
                    <Select
                        value={card.country}
                        onChange={handleChange('country')}
                        className="flex-autogrid-item"
                        options={countries}
                        disabled={loading}
                    />
                </div>
            </Row>
        </>
    );
};

Card.propTypes = {
    loading: PropTypes.bool.isRequired,
    card: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
};

Card.defaultProps = {
    loading: false
};

export default Card;
