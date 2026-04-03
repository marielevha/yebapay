package com.yebapay.core.common.currency;

import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class CurrencyMetadataResolver {

    private static final Map<String, CurrencyMetadata> KNOWN_CURRENCIES = Map.of(
        "XAF", new CurrencyMetadata("XAF", "FCFA", "Franc CFA (BEAC)")
    );

    public CurrencyMetadata resolve(String currencyCode) {
        String normalizedCode = normalize(currencyCode);
        if (normalizedCode == null) {
            return new CurrencyMetadata(null, null, null);
        }

        return KNOWN_CURRENCIES.getOrDefault(
            normalizedCode,
            new CurrencyMetadata(normalizedCode, normalizedCode, normalizedCode)
        );
    }

    private String normalize(String currencyCode) {
        if (currencyCode == null || currencyCode.isBlank()) {
            return null;
        }
        return currencyCode.trim().toUpperCase(Locale.ROOT);
    }
}
