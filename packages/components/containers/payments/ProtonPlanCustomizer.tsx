import { ComponentPropsWithoutRef, ReactElement, ReactNode, useState } from 'react';

import { c, msgid } from 'ttag';

import {
    ADDON_NAMES,
    BRAND_NAME,
    GIGA,
    MAX_ADDRESS_ADDON,
    MAX_DOMAIN_PRO_ADDON,
    MAX_IPS_ADDON,
    MAX_MEMBER_ADDON,
    MAX_MEMBER_VPN_B2B_ADDON,
    MAX_SPACE_ADDON,
    MAX_VPN_ADDON,
} from '@proton/shared/lib/constants';
import { getSupportedAddons, setQuantity } from '@proton/shared/lib/helpers/planIDs';
import { getVPNDedicatedIPs, hasVpnBusiness } from '@proton/shared/lib/helpers/subscription';
import {
    Currency,
    Cycle,
    MaxKeys,
    Organization,
    Plan,
    PlanIDs,
    Subscription,
    getPlanMaxIPs,
} from '@proton/shared/lib/interfaces';
import clsx from '@proton/utils/clsx';

import { Icon, Info, Price } from '../../components';

const AddonKey: Readonly<{
    [K in ADDON_NAMES]: MaxKeys;
}> = {
    [ADDON_NAMES.ADDRESS]: 'MaxAddresses',
    [ADDON_NAMES.MEMBER]: 'MaxMembers',
    [ADDON_NAMES.DOMAIN]: 'MaxDomains',
    [ADDON_NAMES.DOMAIN_BUNDLE_PRO]: 'MaxDomains',
    [ADDON_NAMES.DOMAIN_ENTERPRISE]: 'MaxDomains',
    [ADDON_NAMES.VPN]: 'MaxVPN',
    [ADDON_NAMES.SPACE]: 'MaxSpace',
    [ADDON_NAMES.MEMBER_MAIL_PRO]: 'MaxMembers',
    [ADDON_NAMES.MEMBER_DRIVE_PRO]: 'MaxMembers',
    [ADDON_NAMES.MEMBER_BUNDLE_PRO]: 'MaxMembers',
    [ADDON_NAMES.MEMBER_ENTERPRISE]: 'MaxMembers',
    [ADDON_NAMES.MEMBER_VPN_PRO]: 'MaxMembers',
    [ADDON_NAMES.MEMBER_VPN_BUSINESS]: 'MaxMembers',
    [ADDON_NAMES.IP_VPN_BUSINESS]: 'MaxIPs',
    [ADDON_NAMES.MEMBER_PASS_PRO]: 'MaxMembers',
    [ADDON_NAMES.MEMBER_PASS_BUSINESS]: 'MaxMembers',
} as const;

export type CustomiserMode = 'signup' | undefined;

interface Props extends ComponentPropsWithoutRef<'div'> {
    cycle: Cycle;
    currency: Currency;
    currentPlan: Plan;
    planIDs: PlanIDs;
    onChangePlanIDs: (planIDs: PlanIDs) => void;
    plansMap: { [key: string]: Plan };
    organization?: Organization;
    loading?: boolean;
    mode?: CustomiserMode;
    forceHideDescriptions?: boolean;
    showUsersTooltip?: boolean;
    currentSubscription?: Subscription;
}

const ButtonNumberInput = ({
    value,
    onChange,
    id,
    min = 0,
    max = 999,
    step = 1,
    disabled = false,
}: {
    step?: number;
    id: string;
    min?: number;
    max?: number;
    value: number;
    disabled?: boolean;
    onChange?: (newValue: number) => void;
}) => {
    const [tmpValue, setTmpValue] = useState<number | undefined>(value);

    const getIsValidValue = (newValue?: number) => {
        return newValue !== undefined && newValue >= min && newValue <= max && newValue % step === 0;
    };

    const isDecDisabled = disabled || !getIsValidValue((tmpValue || 0) - step);
    const isIncDisabled = disabled || !getIsValidValue((tmpValue || 0) + step);

    const isValidTmpValue = getIsValidValue(tmpValue);

    return (
        <div className="border rounded shrink-0 flex flex-nowrap">
            <button
                type="button"
                title={c('Action').t`Decrease`}
                className={clsx(['p-2 flex', isDecDisabled && 'color-disabled'])}
                disabled={isDecDisabled}
                onClick={() => {
                    if (!isValidTmpValue || tmpValue === undefined) {
                        return;
                    }
                    const newValue = tmpValue - step;
                    setTmpValue?.(newValue);
                    onChange?.(newValue);
                }}
            >
                <Icon name="minus" alt={c('Action').t`Decrease`} className="m-auto" />
            </button>
            <label htmlFor={id} className="my-2 flex">
                <input
                    autoComplete="off"
                    min={min}
                    max={max}
                    value={tmpValue}
                    id={id}
                    className="w-custom border-left border-right text-center"
                    style={{ '--w-custom': '6em' }}
                    onBlur={() => {
                        if (!isValidTmpValue) {
                            // Revert to the latest valid value upon blur
                            setTmpValue(value);
                        }
                    }}
                    onChange={({ target: { value: newValue } }) => {
                        if (newValue === '') {
                            setTmpValue?.(undefined);
                            return;
                        }
                        const newIntValue = parseInt(newValue, 10);
                        setTmpValue?.(newIntValue);
                        if (getIsValidValue(newIntValue)) {
                            onChange?.(newIntValue);
                        }
                    }}
                />
            </label>
            <button
                type="button"
                title={c('Action').t`Increase`}
                className={clsx(['p-2 flex', isIncDisabled && 'color-disabled'])}
                disabled={isIncDisabled}
                onClick={() => {
                    if (!isValidTmpValue || tmpValue === undefined) {
                        return;
                    }
                    const newValue = tmpValue + step;
                    setTmpValue?.(newValue);
                    onChange?.(newValue);
                }}
            >
                <Icon name="plus" alt={c('Action').t`Increase`} className="m-auto" />
            </button>
        </div>
    );
};

const addonLimit = {
    [ADDON_NAMES.SPACE]: MAX_SPACE_ADDON,
    [ADDON_NAMES.MEMBER]: MAX_MEMBER_ADDON,
    [ADDON_NAMES.DOMAIN]: MAX_DOMAIN_PRO_ADDON,
    [ADDON_NAMES.DOMAIN_BUNDLE_PRO]: MAX_DOMAIN_PRO_ADDON,
    [ADDON_NAMES.DOMAIN_ENTERPRISE]: MAX_DOMAIN_PRO_ADDON,
    [ADDON_NAMES.ADDRESS]: MAX_ADDRESS_ADDON,
    [ADDON_NAMES.VPN]: MAX_VPN_ADDON,
    [ADDON_NAMES.MEMBER_MAIL_PRO]: MAX_MEMBER_ADDON,
    [ADDON_NAMES.MEMBER_DRIVE_PRO]: MAX_MEMBER_ADDON,
    [ADDON_NAMES.MEMBER_BUNDLE_PRO]: MAX_MEMBER_ADDON,
    [ADDON_NAMES.MEMBER_ENTERPRISE]: MAX_MEMBER_ADDON,
    [ADDON_NAMES.MEMBER_VPN_PRO]: MAX_MEMBER_VPN_B2B_ADDON,
    [ADDON_NAMES.MEMBER_VPN_BUSINESS]: MAX_MEMBER_VPN_B2B_ADDON,
    [ADDON_NAMES.IP_VPN_BUSINESS]: MAX_IPS_ADDON,
    [ADDON_NAMES.MEMBER_PASS_PRO]: MAX_MEMBER_ADDON,
    [ADDON_NAMES.MEMBER_PASS_BUSINESS]: MAX_MEMBER_ADDON,
} as const;

// translator: This string is a part of a larger string asking the user to "contact" our sales team => full sentence: Should you need more than ${maxUsers} user accounts, please <contact> our Sales team
const contactString = c('plan customizer, users').t`contact`;
const contactHref = (
    <a key={1} href="mailto:enterprise@proton.me">
        {contactString}
    </a>
);

// Since ttag doesn't support ngettext with jt, we manually replace the string with a react node...
const getAccountSizeString = (maxUsers: number, price: ReactNode) => {
    // translator: This string is followed up by the string "Should you need more than ${maxUsers} user accounts, please <contact> our Sales team"
    const first = c('plan customizer, users')
        .jt`Select the number of users to include in your plan. Each additional user costs ${price}.`;

    const contact = '_TMPL_';

    const second = c('plan customizer, users').ngettext(
        msgid`Should you need more than ${maxUsers} user account, please ${contact} our Sales team.`,
        `Should you need more than ${maxUsers} user accounts, please ${contact} our Sales team.`,
        maxUsers
    );
    return [
        first,
        ' ',
        ...second
            .split(contact)
            .map((value, index, arr) => (index !== arr.length - 1 ? [value, contactHref] : [value])),
    ];
};

const ORG_SIZE_ADDONS = [
    ADDON_NAMES.MEMBER_VPN_BUSINESS,
    ADDON_NAMES.MEMBER_VPN_PRO,
    ADDON_NAMES.MEMBER_PASS_BUSINESS,
    ADDON_NAMES.MEMBER_PASS_PRO,
];

const AccountSizeCustomiser = ({
    addon,
    maxUsers,
    price,
    input,
    showDescription = true,
    showTooltip = true,
}: {
    addon: Plan;
    maxUsers: number;
    price: ReactElement;
    input: ReactElement;
    showDescription?: boolean;
    showTooltip?: boolean;
}) => {
    const mode = ORG_SIZE_ADDONS.some((name) => addon.Name === name) ? 'org-size' : 'users';
    return (
        <div className={clsx(showDescription ? 'mb-8' : 'mb-4')}>
            {showDescription && mode === 'users' && (
                <>
                    <h2 className="text-2xl text-bold mb-4">{c('Info').t`Account size`}</h2>
                    <div className="mb-4">{getAccountSizeString(maxUsers, price)}</div>
                </>
            )}
            <div className="flex *:min-size-auto md:flex-nowrap items-center mb-4">
                <label
                    htmlFor={addon.Name}
                    className="w-full md:w-auto min-w-custom md:min-w-custom flex-1 plan-customiser-addon-label text-bold pr-2"
                    style={{ '--min-w-custom': '8em', '--md-min-w-custom': '14em' }}
                >
                    {mode === 'org-size' ? c('Info').t`Organization size` : c('Info').t`Users`}
                    {showTooltip && mode === 'users' && (
                        <Info
                            buttonClass="ml-2"
                            title={c('Info')
                                .t`A user is an account associated with a single username, mailbox, and person`}
                        />
                    )}
                </label>
                {input}
            </div>
        </div>
    );
};
const AdditionalOptionsCustomiser = ({
    addon,
    price,
    input,
    showDescription = true,
}: {
    addon: Plan;
    price: ReactElement;
    input: ReactElement;
    showDescription?: boolean;
}) => {
    return (
        <>
            {showDescription && (
                <>
                    <h2 className="text-2xl text-bold mb-4">{c('Info').t`Additional options`}</h2>
                    <div className="mb-4">
                        {c('Info')
                            .jt`Email hosting for 10 custom email domain names is included for free. Additional domains can be added for ${price}.`}
                    </div>
                </>
            )}
            <div className="flex *:min-size-auto md:flex-nowrap items-center mb-4">
                <label
                    htmlFor={addon.Name}
                    className="w-full md:w-auto min-w-custom md:min-w-custom flex-1 plan-customiser-addon-label text-bold pr-2"
                    style={{ '--min-w-custom': '8em', '--md-min-w-custom': '14em' }}
                >
                    {c('Info').t`Custom email domains`}
                    <Info
                        className="ml-2"
                        title={c('Info')
                            .t`Email hosting is only available for domains you already own. Domain registration is not currently available through ${BRAND_NAME}. You can host email for domains registered on any domain registrar.`}
                    />
                </label>
                {input}
            </div>
        </>
    );
};

const IPsNumberCustomiser = ({
    addon,
    maxIPs,
    price,
    input,
    showDescription = true,
}: {
    addon: Plan;
    maxIPs: number;
    price: ReactElement;
    input: ReactElement;
    showDescription?: boolean;
}) => {
    const title = c('Info').t`Dedicated servers`;

    const select = c('plan customizer, ips')
        .jt`Select the number of IPs to include in your plan. Each additional IP costs ${price}.`;

    // translator: the plural is based on maxIPs variable (number written in digits). This string is part of another one, full sentence is: Should you need more than <maxIPs> IPs, (please <contact> our Sales team).
    const description = c('plan customizer, ips').ngettext(
        msgid`Should you need more than ${maxIPs} IP, `,
        `Should you need more than ${maxIPs} IPs, `,
        maxIPs
    );

    // translator: this string is part of another one, full sentence is: (Should you need more than <maxIPs> IPs, )please <contact> our Sales team.
    const pleaseContact = c('plan customizer, ips').jt`please ${contactHref} our Sales team.`;

    return (
        <div className={clsx(showDescription ? 'mb-8' : 'mb-4')}>
            {showDescription && (
                <>
                    <h2 className="text-2xl text-bold mb-4">{title}</h2>
                    <div className="mb-4">
                        {select}
                        {description}
                        {pleaseContact}
                    </div>
                </>
            )}
            <div className="flex *:min-size-auto md:flex-nowrap items-center mb-4">
                <label
                    htmlFor={addon.Name}
                    className="w-full md:w-auto min-w-custom md:min-w-custom flex-1 plan-customiser-addon-label text-bold pr-2"
                    style={{ '--min-w-custom': '8em', '--md-min-w-custom': '14em' }}
                >
                    {title}
                    <Info buttonClass="ml-2" title={c('Info').t`Number of dedicated servers in the organization`} />
                </label>
                {input}
            </div>
        </div>
    );
};

const ProtonPlanCustomizer = ({
    cycle,
    mode,
    currency,
    onChangePlanIDs,
    planIDs,
    plansMap,
    currentPlan,
    organization,
    loading,
    className,
    forceHideDescriptions,
    showUsersTooltip,
    currentSubscription,
    ...rest
}: Props) => {
    const supportedAddons = getSupportedAddons(planIDs);
    const showAddonDescriptions = mode !== 'signup' && !forceHideDescriptions;

    return (
        <div className={clsx(['plan-customiser', className])} {...rest}>
            {Object.entries(supportedAddons).map(([addonName]) => {
                const addon = plansMap[addonName];

                if (!addon) {
                    return null;
                }

                const addonNameKey = addon.Name as ADDON_NAMES;
                const quantity = planIDs[addon.Name] ?? 0;

                const isSupported = !!supportedAddons[addonNameKey];
                const addonMaxKey = AddonKey[addonNameKey];
                /**
                 * Workaround specifically for MaxIPs property. There is an upcoming mirgation in payments API v5
                 * That will sctructure all these Max* properties in a different way.
                 * For now, we need to handle MaxIPs separately.
                 * See {@link MaxKeys} and {@link Plan}. Note that all properties from MaxKeys must be present in Plan
                 * with the exception of MaxIPs.
                 */
                let addonMultiplier: number;
                if (addonMaxKey === 'MaxIPs') {
                    addonMultiplier = getPlanMaxIPs(addon);
                    if (addonMultiplier === 0) {
                        addonMultiplier = 1;
                    }
                } else {
                    addonMultiplier = addon[addonMaxKey] ?? 1;
                }

                // The same workaround as above
                let min: number;
                if (addonMaxKey === 'MaxIPs') {
                    min = getPlanMaxIPs(currentPlan);
                } else {
                    min = currentPlan[addonMaxKey] ?? 0;
                }
                const max = addonLimit[addonNameKey] * addonMultiplier;
                // Member addon comes with MaxSpace + MaxAddresses
                const value = isSupported
                    ? min + quantity * addonMultiplier
                    : Object.entries(planIDs).reduce((acc, [planName, quantity]) => {
                          // and the same workaround as above
                          let multiplier: number;
                          if (addonMaxKey === 'MaxIPs') {
                              multiplier = getPlanMaxIPs(plansMap[planName]);
                          } else {
                              multiplier = plansMap[planName][addonMaxKey];
                          }

                          return acc + quantity * multiplier;
                      }, 0);
                const divider = addonNameKey === ADDON_NAMES.SPACE ? GIGA : 1;
                const maxTotal = max / divider;

                const addonPricePerCycle = addon.Pricing[cycle] || 0;
                const addonPriceInline = (
                    <Price key={`${addon.Name}-1`} currency={currency} suffix={c('Suffix for price').t`per month`}>
                        {addonPricePerCycle / cycle}
                    </Price>
                );

                const canDowngrade = addonMaxKey !== 'MaxIPs' || !hasVpnBusiness(currentSubscription);
                const displayMin = canDowngrade ? min / divider : getVPNDedicatedIPs(currentSubscription);

                const input = (
                    <ButtonNumberInput
                        key={`${addon.Name}-input`}
                        id={addon.Name}
                        value={value / divider}
                        min={displayMin}
                        max={maxTotal}
                        disabled={loading || !isSupported}
                        onChange={(newQuantity) => {
                            onChangePlanIDs(
                                setQuantity(planIDs, addon.Name, (newQuantity * divider - min) / addonMultiplier)
                            );
                        }}
                        step={addonMultiplier}
                    />
                );

                if (
                    [
                        ADDON_NAMES.MEMBER,
                        ADDON_NAMES.MEMBER_BUNDLE_PRO,
                        ADDON_NAMES.MEMBER_DRIVE_PRO,
                        ADDON_NAMES.MEMBER_MAIL_PRO,
                        ADDON_NAMES.MEMBER_ENTERPRISE,
                        ADDON_NAMES.MEMBER_VPN_PRO,
                        ADDON_NAMES.MEMBER_VPN_BUSINESS,
                        ADDON_NAMES.MEMBER_PASS_PRO,
                        ADDON_NAMES.MEMBER_PASS_BUSINESS,
                    ].includes(addonNameKey)
                ) {
                    return (
                        <AccountSizeCustomiser
                            key={`${addon.Name}-size`}
                            addon={addon}
                            price={addonPriceInline}
                            input={input}
                            maxUsers={maxTotal}
                            showDescription={showAddonDescriptions}
                            showTooltip={showUsersTooltip}
                        />
                    );
                }

                if (
                    mode !== 'signup' &&
                    [ADDON_NAMES.DOMAIN, ADDON_NAMES.DOMAIN_BUNDLE_PRO, ADDON_NAMES.DOMAIN_ENTERPRISE].includes(
                        addonNameKey
                    )
                ) {
                    return (
                        <AdditionalOptionsCustomiser
                            key={`${addon.Name}-options`}
                            addon={addon}
                            price={addonPriceInline}
                            input={input}
                            showDescription={showAddonDescriptions}
                        />
                    );
                }

                if (addonNameKey === ADDON_NAMES.IP_VPN_BUSINESS) {
                    return (
                        <IPsNumberCustomiser
                            key={`${addon.Name}-ips`}
                            addon={addon}
                            price={addonPriceInline}
                            input={input}
                            showDescription={showAddonDescriptions}
                            maxIPs={maxTotal}
                        />
                    );
                }

                return null;
            })}
        </div>
    );
};

export default ProtonPlanCustomizer;
