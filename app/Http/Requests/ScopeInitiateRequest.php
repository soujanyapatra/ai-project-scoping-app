<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScopeInitiateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'projectType' => ['required', 'string', 'max:64'],
            'industry' => ['required', 'string', 'max:255'],
            'budgetUsd' => ['nullable', 'numeric', 'min:0'],
            'timelineStart' => ['nullable', 'date'],
            'timelineEnd' => ['nullable', 'date', 'after_or_equal:timelineStart'],
            'features' => ['required', 'array', 'min:1'],
            'features.*' => ['string', 'max:200'],
            'platforms' => ['required', 'array', 'min:1'],
            'platforms.*' => ['string', 'max:32'],
            'integrations' => ['nullable', 'array'],
            'integrations.*' => ['string', 'max:200'],
            'constraints' => ['nullable', 'string', 'max:4000'],
            'successCriteria' => ['nullable', 'string', 'max:4000'],
        ];
    }
}

